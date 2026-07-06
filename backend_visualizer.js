/* ==========================================================================
   ServiceNow Backend Systems Visualizer (backend_visualizer.js)
   Controls Schema, Approver queues, Flow Designer and REST APIs
   ========================================================================== */

// Store flow execution context
let activeFlowBooking = null;

document.addEventListener('DOMContentLoaded', () => {
  renderApprovalsList();
  updateApiSandboxDescription();
});

// --- DEV HUB TAB NAVIGATION ---

function switchDevTab(tabName) {
  // Hide all dev panes
  const panes = document.querySelectorAll('.dev-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  // Remove active from all dev tabs
  const tabs = document.querySelectorAll('.dev-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Map tab names to DOM ID suffixes to avoid string processing bugs
  let targetId = '';
  if (tabName === 'approver') targetId = 'Approver';
  else if (tabName === 'schema') targetId = 'Schema';
  else if (tabName === 'flow') targetId = 'Flow';
  else if (tabName === 'jobs') targetId = 'Jobs';
  else if (tabName === 'api') targetId = 'Api';
  else if (tabName === 'update-set') targetId = 'UpdateSet';
  else targetId = tabName;

  const targetPane = document.getElementById(`devPane${targetId}`);
  const targetTab = document.getElementById(`devTab${targetId}`);
  
  if (targetPane) targetPane.classList.add('active');
  if (targetTab) targetTab.classList.add('active');

  // Trigger special tab loads
  if (tabName === 'flow') {
    updateFlowDesignerVisualState();
  } else if (tabName === 'approver') {
    renderApprovalsList();
  } else if (tabName === 'update-set') {
    renderUpdateSetPreview();
  }
}

// --- TABLE SCHEMA EXPLORER ---

function toggleSchemaCard(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.toggle('active');
}

// --- TEAM LEAD / APPROVER CONSOLE ---

function renderApprovalsList() {
  const list = document.getElementById('approvalsList');
  const emptyState = document.getElementById('approvalsEmpty');
  const countBadge = document.getElementById('pendingApprovalsCount');

  list.innerHTML = '';
  
  // Filter bookings in 'requested' state
  const pending = DB.bookings.filter(bk => bk.status === 'requested');
  countBadge.textContent = pending.length;

  if (pending.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  pending.forEach(bk => {
    const facility = DB.facilities.find(f => f.id === bk.facility_id);
    const date = bk.booking_date;
    const slotsLabels = bk.slots.map(sid => {
      const slot = DB.slots.find(s => s.id === sid);
      return slot ? slot.label : sid;
    }).join(', ');

    const card = document.createElement('div');
    card.className = 'approval-card';
    card.innerHTML = `
      <div class="approval-head">
        <span class="approval-number">SysApproval: ${bk.number}</span>
        <span class="badge badge-requested">Requested Approval</span>
      </div>
      
      <div class="approval-meta-row">
        <div class="meta-col">
          <strong>Requester</strong>
          <span>${bk.requester} (${bk.department})</span>
        </div>
        <div class="meta-col">
          <strong>Court / Facility</strong>
          <span>${facility ? facility.name : 'Unknown'}</span>
        </div>
        <div class="meta-col">
          <strong>Date Requested</strong>
          <span>${date}</span>
        </div>
        <div class="meta-col">
          <strong>Requested Slots</strong>
          <span>${slotsLabels}</span>
        </div>
      </div>

      <div class="approval-reason">
        <strong>Reason for Booking:</strong><br>
        "${bk.purpose}"
      </div>

      <input type="text" id="comment-${bk.sys_id}" placeholder="Optional approval / rejection comments..." class="approval-comment-input">

      <div class="approval-actions">
        <button class="btn btn-primary btn-sm" onclick="processApproval('${bk.sys_id}', 'approved')"><i class="fa-solid fa-check"></i> Approve</button>
        <button class="btn btn-secondary btn-sm" onclick="processApproval('${bk.sys_id}', 'rejected')" style="border-color: var(--status-booked); color: var(--status-booked);"><i class="fa-solid fa-xmark"></i> Reject</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function processApproval(sysId, outcome) {
  const booking = DB.bookings.find(bk => bk.sys_id === sysId);
  if (!booking) return;

  const commentInput = document.getElementById(`comment-${sysId}`);
  const commentText = commentInput ? commentInput.value.trim() : '';

  // Update Status
  booking.status = outcome;
  booking.comments = commentText ? `Approver Comments: ${commentText}` : `Processed by Approver.`;

  // Visual Update
  renderApprovalsList();
  renderMyBookings();
  refreshUIState();
  if (currentBookingState.selectedFacility) {
    renderSlots();
  }

  // Update Flow Designer visual steps if this is the active flow item
  if (activeFlowBooking && activeFlowBooking.sys_id === sysId) {
    activeFlowBooking.status = outcome;
    activeFlowBooking.comments = booking.comments;
    updateFlowDesignerVisualState();
  }

  // Generate Email/SMS notification logs
  if (outcome === 'approved') {
    addNotification('Email Notification Sent (Confirmation)', booking.requester, 
      `Reservation APPROVED: ${booking.number}\n\nFacility: ${DB.facilities.find(f => f.id === booking.facility_id).name}\nDate: ${booking.booking_date}\n\nEnjoy your game!\nComments: ${booking.comments}`, 'email');
    showToast(`Approved booking request ${booking.number}`, 'success');
  } else {
    addNotification('Email Notification Sent (Rejection)', booking.requester, 
      `Reservation REJECTED: ${booking.number}\n\nFacility: ${DB.facilities.find(f => f.id === booking.facility_id).name}\nDate: ${booking.booking_date}\n\nReason: ${booking.comments}`, 'email');
    showToast(`Rejected booking request ${booking.number}`, 'error');
  }
}

// --- FLOW DESIGNER SIMULATOR ---

function triggerFlowDesignerExecution(bookingRecord) {
  activeFlowBooking = bookingRecord;
  updateFlowDesignerVisualState();
  showToast(`Flow Designer started workflow for ${bookingRecord.number}`, 'info');
}

function updateFlowDesignerVisualState() {
  const stepTrigger = document.getElementById('flowStepTrigger');
  const stepAction1 = document.getElementById('flowStepAction1');
  const stepAction2 = document.getElementById('flowStepAction2');
  const statusPill = document.getElementById('flowApprovalStatus');
  const branches = document.querySelectorAll('.flow-branch');

  // Reset steps
  stepTrigger.classList.remove('active-step');
  stepAction1.classList.remove('active-step');
  stepAction2.classList.remove('active-step');
  statusPill.className = 'flow-step-status state-pending';
  statusPill.textContent = 'Idle';
  
  branches.forEach(b => {
    b.style.borderColor = 'var(--border-color)';
    b.style.backgroundColor = 'rgba(0,0,0,0.005)';
  });

  if (!activeFlowBooking) {
    statusPill.textContent = 'No Active Flow';
    return;
  }

  // Active steps lighting based on booking status
  stepTrigger.classList.add('active-step');
  stepAction1.classList.add('active-step');

  if (activeFlowBooking.status === 'requested') {
    stepAction2.classList.add('active-step');
    statusPill.textContent = 'Waiting Approval';
    statusPill.className = 'flow-step-status state-active';
  } else if (activeFlowBooking.status === 'approved') {
    statusPill.textContent = 'Approved';
    statusPill.className = 'flow-step-status';
    statusPill.style.color = 'var(--status-available)';
    
    // Highlight approve branch
    const approveBranch = document.querySelector('.branch-approve');
    approveBranch.style.borderColor = 'var(--status-available)';
    approveBranch.style.backgroundColor = 'var(--status-available-bg)';
  } else if (activeFlowBooking.status === 'rejected') {
    statusPill.textContent = 'Rejected';
    statusPill.className = 'flow-step-status';
    statusPill.style.color = 'var(--status-booked)';
    
    // Highlight reject branch
    const rejectBranch = document.querySelector('.branch-reject');
    rejectBranch.style.borderColor = 'var(--status-booked)';
    rejectBranch.style.backgroundColor = 'var(--status-booked-bg)';
  }
}

// --- SCHEDULED SCRIPTS SIMULATOR ---

function triggerScheduledJob(jobType) {
  if (jobType === 'maintenance') {
    // Put Badminton court in Maintenance mode
    const bad = DB.facilities.find(f => f.id === 'fac-badminton');
    if (bad) {
      bad.status = 'maintenance';
      showToast('Scheduled Job executed: Set Badminton Court to Maintenance.', 'warning');
      addNotification('System Alert Logged', 'shbs_admin', 'SHBS Facility Maintenance script automatically activated: Badminton Court slots locked.', 'sms');
      
      // Update portal UI
      renderFacilities();
      if (currentBookingState.selectedFacility?.id === 'fac-badminton') {
        renderSlots();
      }
    }
  } else if (jobType === 'expire') {
    // Cancel requested bookings that are older than "today"
    let expiredCount = 0;
    DB.bookings.forEach(bk => {
      if (bk.status === 'requested' && bk.booking_date === today) {
        bk.status = 'cancelled';
        bk.comments = 'System automatically closed request due to inactivity (Simulated 48h limit).';
        expiredCount++;
        
        addNotification('Email Notification Sent (Auto-cancel)', bk.requester, 
          `Reservation EXPIRED: ${bk.number}\n\nYour request has been cancelled automatically because it was not approved in time.`, 'email');
      }
    });

    if (expiredCount > 0) {
      showToast(`Scheduled Job: Cancelled ${expiredCount} idle booking requests.`, 'info');
      renderApprovalsList();
      renderMyBookings();
      refreshUIState();
      renderSlots();
    } else {
      showToast('Scheduled Job executed: No idle bookings found to expire.', 'info');
    }
  }
}

// --- REST API SANDBOX EXPLORER ---

function updateApiSandboxDescription() {
  const select = document.getElementById('apiEndpointSelect');
  const desc = document.getElementById('apiEndpointDescription');
  const paramsContainer = document.getElementById('apiParamsContainer');
  const payloadContainer = document.getElementById('apiPayloadContainer');

  const endpoint = select.value;

  if (endpoint === 'GET_AVAILABILITY') {
    desc.textContent = 'Fetches real-time status listings for all sports court slots on a specified date.';
    paramsContainer.classList.remove('hidden');
    payloadContainer.classList.add('hidden');
  } else if (endpoint === 'POST_BOOKING') {
    desc.textContent = 'Creates a new sports court booking in the ServiceNow database. Validates request parameters and triggers internal Flow Designer approvals.';
    paramsContainer.classList.add('hidden');
    payloadContainer.classList.remove('hidden');
  } else if (endpoint === 'GET_MY_BOOKINGS') {
    desc.textContent = 'Returns JSON structure listing all current bookings registered under the admin/user profile.';
    paramsContainer.classList.add('hidden');
    payloadContainer.classList.add('hidden');
  }
}

function executeApiSandboxRequest() {
  const select = document.getElementById('apiEndpointSelect');
  const consoleOut = document.getElementById('apiConsoleOutput');
  const consoleStatus = document.getElementById('apiConsoleStatus');
  
  const endpoint = select.value;
  consoleStatus.textContent = 'Sending...';
  consoleStatus.className = 'status-pill';

  setTimeout(() => {
    let statusCode = 200;
    let statusText = 'OK';
    let responseData = null;

    if (endpoint === 'GET_AVAILABILITY') {
      const date = document.getElementById('apiParamDate').value;
      const facilityId = document.getElementById('apiParamFacilityId').value;
      
      const facility = DB.facilities.find(f => f.id === facilityId);
      
      if (!facility) {
        statusCode = 404;
        statusText = 'Not Found';
        responseData = { error: { message: `Facility with ID '${facilityId}' not found.`, detail: 'Table entry missing.' } };
      } else {
        // Compile list of slots status
        const slotAvailability = DB.slots.map(s => {
          const matchingBk = DB.bookings.find(b => 
            b.facility_id === facilityId && b.booking_date === date && b.slots.includes(s.id) && b.status !== 'cancelled' && b.status !== 'rejected'
          );
          
          let state = 'available';
          if (matchingBk) {
            state = matchingBk.status === 'requested' ? 'pending' : 'booked';
          }

          return { slot_id: s.id, time: s.label, status: state };
        });

        responseData = {
          result: {
            facility_name: facility.name,
            query_date: date,
            slots: slotAvailability
          }
        };
      }
    } else if (endpoint === 'POST_BOOKING') {
      const payloadText = document.getElementById('apiRequestPayloadText').value;
      
      try {
        const body = JSON.parse(payloadText);
        
        // Basic parameters check
        if (!body.facility_id || !body.date || !body.slots || body.slots.length === 0) {
          statusCode = 400;
          statusText = 'Bad Request';
          responseData = { error: { message: 'Missing required fields in payload.', detail: 'Parameters facility_id, date, and slots list are mandatory.' } };
        } else {
          // Conflict check
          const hasConflict = DB.bookings.some(bk => 
            bk.facility_id === body.facility_id && 
            bk.booking_date === body.date && 
            bk.slots.some(s => body.slots.includes(s)) &&
            bk.status !== 'cancelled' && 
            bk.status !== 'rejected'
          );

          if (hasConflict) {
            statusCode = 409;
            statusText = 'Conflict';
            responseData = { error: { message: 'Double-booking conflict identified on selected slot criteria.', detail: 'One or more slots requested are already reserved.' } };
          } else {
            statusCode = 201;
            statusText = 'Created';
            
            const bookingNum = generateBookingNumber();
            const sysId = 'bk-api-' + Math.random().toString(36).substr(2, 9);
            const facility = DB.facilities.find(f => f.id === body.facility_id);
            const cost = (facility ? facility.hourly_rate : 10) * 2 * body.slots.length;
            const dateNow = new Date().toISOString().replace('T', ' ').substr(0, 19);

            const apiBooking = {
              sys_id: sysId,
              number: bookingNum,
              facility_id: body.facility_id,
              booking_date: body.date,
              slots: body.slots,
              requester: 'Integration API User',
              department: 'API Sandbox Client',
              purpose: body.purpose || 'Scripted API Request',
              attendees: body.attendees || 1,
              approver: body.approver || 'john.lead@company.com',
              total_cost: cost,
              status: 'requested',
              created_on: dateNow,
              comments: 'Created via custom REST Endpoint API.'
            };

            DB.bookings.push(apiBooking);
            
            // Run Flow Designer simulator
            triggerFlowDesignerExecution(apiBooking);
            
            // Refresh main interface views
            renderMyBookings();
            renderApprovalsList();
            refreshUIState();
            if (currentBookingState.selectedFacility) renderSlots();

            responseData = {
              result: {
                sys_id: sysId,
                number: bookingNum,
                status: 'requested',
                created_on: dateNow,
                api_comment: 'Record successfully registered, workflow approval queued.'
              }
            };
          }
        }
      } catch (err) {
        statusCode = 400;
        statusText = 'Bad Request';
        responseData = { error: { message: 'Malformed JSON payload formatting.', detail: err.message } };
      }
    } else if (endpoint === 'GET_MY_BOOKINGS') {
      responseData = {
        result: DB.bookings.map(bk => ({
          sys_id: bk.sys_id,
          number: bk.number,
          facility: bk.facility_id,
          date: bk.booking_date,
          slots: bk.slots,
          status: bk.status,
          total_cost: bk.total_cost,
          requester: bk.requester
        }))
      };
    }

    // Render output in console
    consoleStatus.textContent = `${statusCode} ${statusText}`;
    if (statusCode >= 200 && statusCode < 300) {
      consoleStatus.className = 'status-pill success';
    } else {
      consoleStatus.className = 'status-pill error';
    }

    const responseHeaders = `HTTP/1.1 ${statusCode} ${statusText}\nDate: ${new Date().toUTCString()}\nContent-Type: application/json; charset=utf-8\nServer: ServiceNow/Vancouver\nX-Transaction-ID: tx-${Math.random().toString(36).substr(2, 9)}\n\n`;
    
    consoleOut.textContent = responseHeaders + JSON.stringify(responseData, null, 2);
  }, 600);
}
