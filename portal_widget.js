/* ==========================================================================
   ServiceNow Service Portal Widget Controller (portal_widget.js)
   Simulates AngularJS Client Controller & Server Script logic
   ========================================================================== */

// --- ServiceNow Schema In-Memory Databases ---
const DB = {
  // x_shbs_sports_hall
  facilities: [
    { id: 'fac-badminton', name: 'Badminton Court A', type: 'Badminton', hourly_rate: 10, capacity: 4, status: 'operational', icon: 'fa-solid fa-feather' },
    { id: 'fac-tennis', name: 'Tennis Court 1', type: 'Tennis', hourly_rate: 15, capacity: 4, status: 'operational', icon: 'fa-solid fa-baseball' },
    { id: 'fac-basketball', name: 'Main Basketball Court', type: 'Basketball', hourly_rate: 20, capacity: 10, status: 'operational', icon: 'fa-solid fa-basketball' },
    { id: 'fac-football', name: 'Indoor Football Turf', type: 'Football', hourly_rate: 25, capacity: 12, status: 'operational', icon: 'fa-solid fa-republican' } // replacing icon with soccer-ball in render
  ],
  
  // Available predefined slots (x_shbs_slot)
  slots: [
    { id: 'slot-1', start: '08:00', end: '10:00', label: '08:00 AM - 10:00 AM' },
    { id: 'slot-2', start: '10:00', end: '12:00', label: '10:00 AM - 12:00 PM' },
    { id: 'slot-3', start: '12:00', end: '14:00', label: '12:00 PM - 02:00 PM' },
    { id: 'slot-4', start: '14:00', end: '16:00', label: '02:00 PM - 04:00 PM' },
    { id: 'slot-5', start: '16:00', end: '18:00', label: '04:00 PM - 06:00 PM' },
    { id: 'slot-6', start: '18:00', end: '20:00', label: '06:00 PM - 08:00 PM' },
    { id: 'slot-7', start: '20:00', end: '22:00', label: '08:00 PM - 10:00 PM' }
  ],

  // x_shbs_booking (Mock initial data)
  bookings: [
    {
      sys_id: 'bk-init-1',
      number: 'BK0001001',
      facility_id: 'fac-badminton',
      booking_date: '', // Will be set to today's date dynamically
      slots: ['slot-2'],
      requester: 'David Smith',
      department: 'Finance',
      purpose: 'Regular Weekly Singles Practice',
      attendees: 2,
      approver: 'john.lead@company.com',
      total_cost: 20,
      status: 'approved',
      created_on: '',
      comments: 'Approved by John Doe.'
    },
    {
      sys_id: 'bk-init-2',
      number: 'BK0001002',
      facility_id: 'fac-football',
      booking_date: '', // Set dynamically
      slots: ['slot-6'],
      requester: 'Sarah Jenkins',
      department: 'Marketing',
      purpose: 'Team Bonding Friendly Match',
      attendees: 10,
      approver: 'sarah.manager@company.com',
      total_cost: 50,
      status: 'rejected',
      created_on: '',
      comments: 'Rejection reason: The court is reserved for maintenance check later.'
    }
  ],

  // System notification logs (simulating out-of-box emails/SMS)
  notifications: []
};

// Global State
let currentBookingState = {
  selectedFacility: null,
  selectedDate: '',
  selectedSlots: [] // Array of slot IDs
};

// Initialize Date Variables
const today = new Date().toISOString().split('T')[0];
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 7);
const maxDateString = maxDate.toISOString().split('T')[0];

// On Document Load
document.addEventListener('DOMContentLoaded', () => {
  // Set up date selectors constraints
  const dateInput = document.getElementById('bookingDate');
  dateInput.min = today;
  dateInput.max = maxDateString;
  dateInput.value = today;
  currentBookingState.selectedDate = today;

  // Set mock booking dates relative to today
  DB.bookings[0].booking_date = today;
  DB.bookings[0].created_on = today + ' 09:15:32';
  DB.bookings[1].booking_date = today;
  DB.bookings[1].created_on = today + ' 08:30:10';

  // Render HTML Elements
  renderFacilities();
  renderMyBookings();
  refreshUIState();

  // Bind notifications bell
  document.getElementById('notificationBellBtn').addEventListener('click', toggleNotificationDrawer);
  document.getElementById('notificationDrawerCloseBtn').addEventListener('click', toggleNotificationDrawer);

  // Bind theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Listen to date changes
  dateInput.addEventListener('change', (e) => {
    currentBookingState.selectedDate = e.target.value;
    currentBookingState.selectedSlots = [];
    renderSlots();
    updateCostEstimator();
    checkSectionVisibility();
  });

  // Log initial notifications
  addNotification('Email Notification Sent', 'john.lead@company.com', `A new reservation request (BK0001001) is awaiting your approval.\n\nRequester: David Smith\nDate: ${today}\nFacility: Badminton Court A`, 'email');
});

// --- RENDER FUNCTIONS ---

function renderFacilities() {
  const container = document.getElementById('facilitySelector');
  container.innerHTML = '';

  DB.facilities.forEach(fac => {
    const isSelected = currentBookingState.selectedFacility?.id === fac.id;
    
    // Choose correct icon
    let iconClass = fac.icon;
    if (fac.type === 'Football') iconClass = 'fa-solid fa-circle-nodes'; // soccer-ball representation in FA v6

    const card = document.createElement('div');
    card.className = `facility-card ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-id', fac.id);
    card.onclick = () => selectFacility(fac.id);

    card.innerHTML = `
      <div class="facility-icon-wrap">
        <i class="${iconClass}"></i>
      </div>
      <div class="facility-info">
        <h4>${fac.name}</h4>
        <p>${fac.type} Facility • Max ${fac.capacity} pax</p>
      </div>
      <div class="facility-meta">
        <span class="facility-rate">$${fac.hourly_rate.toFixed(2)} / hr</span>
        <span><i class="fa-solid fa-check-circle text-success"></i> Active</span>
      </div>
      <div class="facility-select-indicator">
        <i class="fa-solid fa-circle-check"></i>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectFacility(id) {
  const selected = DB.facilities.find(f => f.id === id);
  if (!selected) return;

  currentBookingState.selectedFacility = selected;
  currentBookingState.selectedSlots = []; // reset slot selection

  renderFacilities();
  
  // Make slot section visible and re-render
  document.getElementById('dateSlotSection').classList.remove('hidden');
  renderSlots();
  updateCostEstimator();
  checkSectionVisibility();

  showToast(`Selected facility: ${selected.name}`, 'info');
}

function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';

  const facility = currentBookingState.selectedFacility;
  const date = currentBookingState.selectedDate;
  if (!facility || !date) return;

  DB.slots.forEach(slot => {
    // Determine status of this slot for the selected court and date
    let status = 'available'; // Default
    
    // Check if slot has a confirmed or pending booking
    const matchingBooking = DB.bookings.find(bk => 
      bk.facility_id === facility.id && 
      bk.booking_date === date && 
      bk.slots.includes(slot.id) &&
      bk.status !== 'cancelled' && 
      bk.status !== 'rejected'
    );

    if (matchingBooking) {
      if (matchingBooking.status === 'requested') {
        status = 'pending';
      } else if (matchingBooking.status === 'approved') {
        status = 'booked';
      }
    }

    // Check if slot is disabled due to simulated maintenance
    const isMaintenance = facility.status === 'maintenance' || 
      (facility.id === 'fac-tennis' && slot.id === 'slot-1'); // mock maintenance on Tennis morning slot

    if (isMaintenance) {
      status = 'maintenance';
    }

    const box = document.createElement('div');
    let classList = 'slot-box';
    let statusLabel = 'Available';

    if (status === 'available') {
      const isSelected = currentBookingState.selectedSlots.includes(slot.id);
      classList += ` status-avail ${isSelected ? 'selected' : ''}`;
      box.onclick = () => toggleSlotSelection(slot.id);
    } else if (status === 'pending') {
      classList += ' status-pend';
      statusLabel = 'Pending Approval';
    } else if (status === 'booked') {
      classList += ' status-bkd';
      statusLabel = 'Reserved';
    } else if (status === 'maintenance') {
      classList += ' status-maint';
      statusLabel = 'Maintenance';
    }

    box.className = classList;
    box.innerHTML = `
      <span class="time-label">${slot.label}</span>
      <span class="status-label">${statusLabel}</span>
    `;
    grid.appendChild(box);
  });
}

function toggleSlotSelection(slotId) {
  const index = currentBookingState.selectedSlots.indexOf(slotId);
  if (index > -1) {
    currentBookingState.selectedSlots.splice(index, 1);
  } else {
    currentBookingState.selectedSlots.push(slotId);
  }

  renderSlots();
  updateCostEstimator();
  checkSectionVisibility();
}

function checkSectionVisibility() {
  const formSection = document.getElementById('requestFormSection');
  if (currentBookingState.selectedSlots.length > 0) {
    formSection.classList.remove('hidden');
    // Scroll a bit to let the user know form is open
    formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    formSection.classList.add('hidden');
  }
}

function updateCostEstimator() {
  const facility = currentBookingState.selectedFacility;
  const numSlots = currentBookingState.selectedSlots.length;

  const rateValue = document.getElementById('rateValue');
  const slotsCountValue = document.getElementById('slotsCountValue');
  const totalCostValue = document.getElementById('totalCostValue');

  if (!facility) {
    rateValue.textContent = '$0.00';
    slotsCountValue.textContent = '0 slots';
    totalCostValue.textContent = '$0.00';
    return;
  }

  // Under slotting, standard slot size is 2 hours
  const hourlyRate = facility.hourly_rate;
  const slotDurationHours = 2;
  const ratePerSlot = hourlyRate * slotDurationHours;
  const totalCost = ratePerSlot * numSlots;

  rateValue.textContent = `$${hourlyRate.toFixed(2)}/hr ($${ratePerSlot.toFixed(2)}/slot)`;
  slotsCountValue.textContent = `${numSlots} slot${numSlots > 1 ? 's' : ''} (${numSlots * slotDurationHours} hrs)`;
  totalCostValue.textContent = `$${totalCost.toFixed(2)}`;
}

// --- FORM HANDLING ---

function handleFormSubmit(event) {
  event.preventDefault();

  const facility = currentBookingState.selectedFacility;
  const date = currentBookingState.selectedDate;
  const slots = [...currentBookingState.selectedSlots];

  if (!facility || !date || slots.length === 0) {
    showToast('Please select a facility, date, and slots before submitting.', 'error');
    return;
  }

  const purpose = document.getElementById('bookingPurpose').value.trim();
  const attendees = parseInt(document.getElementById('attendeeCount').value);
  const approver = document.getElementById('approverSelect').value;

  // Calculate final cost
  const totalCost = facility.hourly_rate * 2 * slots.length;

  // Server script validation conflict checks
  const conflicts = DB.bookings.some(bk => 
    bk.facility_id === facility.id && 
    bk.booking_date === date && 
    bk.slots.some(s => slots.includes(s)) &&
    bk.status !== 'cancelled' && 
    bk.status !== 'rejected'
  );

  if (conflicts) {
    showToast('Submit failed: One or more selected slots were booked in the meantime.', 'error');
    renderSlots();
    return;
  }

  // Create new ticket reservation
  const bookingNum = generateBookingNumber();
  const sysId = 'bk-' + Math.random().toString(36).substr(2, 9);
  const dateNow = new Date().toISOString().replace('T', ' ').substr(0, 19);

  const newBooking = {
    sys_id: sysId,
    number: bookingNum,
    facility_id: facility.id,
    booking_date: date,
    slots: slots,
    requester: 'System Administrator',
    department: 'Information Technology',
    purpose: purpose,
    attendees: attendees,
    approver: approver,
    total_cost: totalCost,
    status: 'requested',
    created_on: dateNow,
    comments: ''
  };

  // Insert record
  DB.bookings.push(newBooking);

  // Trigger ServiceNow logic visualizers
  if (typeof triggerFlowDesignerExecution === 'function') {
    triggerFlowDesignerExecution(newBooking);
  }

  // Clear selections
  resetBookingForm();
  
  // Switch to My Bookings tab
  switchWidgetTab('my-bookings');
  
  // Show Toast
  showToast(`Booking request ${bookingNum} submitted successfully!`, 'success');
}

function resetBookingForm() {
  document.getElementById('bookingRequestForm').reset();
  currentBookingState.selectedSlots = [];
  renderSlots();
  updateCostEstimator();
  checkSectionVisibility();
}

function generateBookingNumber() {
  const lastBooking = DB.bookings[DB.bookings.length - 1];
  if (!lastBooking) return 'BK0001001';
  const numPart = parseInt(lastBooking.number.replace('BK', '')) + 1;
  return 'BK' + numPart.toString().padStart(7, '0');
}

// --- TAB NAVIGATION ---

function switchWidgetTab(tabName) {
  const paneNew = document.getElementById('paneNewBooking');
  const paneMy = document.getElementById('paneMyBookings');
  const tabNewBtn = document.getElementById('tabNewBookingBtn');
  const tabMyBtn = document.getElementById('tabMyBookingsBtn');

  if (tabName === 'new-booking') {
    paneNew.classList.add('active');
    paneMy.classList.remove('active');
    tabNewBtn.classList.add('active');
    tabMyBtn.classList.remove('active');
    renderSlots();
  } else if (tabName === 'my-bookings') {
    paneNew.classList.remove('active');
    paneMy.classList.add('active');
    tabNewBtn.classList.remove('active');
    tabMyBtn.classList.add('active');
    renderMyBookings();
  }
}

// --- MY BOOKINGS SECTION ---

function renderMyBookings() {
  const tbody = document.getElementById('myBookingsTableBody');
  const emptyState = document.getElementById('myBookingsEmpty');
  const countBadge = document.getElementById('myBookingsCount');
  
  tbody.innerHTML = '';
  
  // Filter for currently logged-in user bookings (mock user = 'System Administrator')
  const userBookings = DB.bookings.filter(b => b.requester === 'System Administrator');
  
  countBadge.textContent = userBookings.length;

  if (userBookings.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Sort by number descending
  const sorted = [...userBookings].sort((a,b) => b.number.localeCompare(a.number));

  sorted.forEach(bk => {
    const facility = DB.facilities.find(f => f.id === bk.facility_id);
    const slotsLabels = bk.slots.map(sid => {
      const slot = DB.slots.find(s => s.id === sid);
      return slot ? slot.label.split(' - ')[0] : sid;
    }).join(', ');

    const tr = document.createElement('tr');
    
    // Status Badge
    let badgeClass = `badge badge-${bk.status}`;
    let displayStatus = bk.status.charAt(0).toUpperCase() + bk.status.slice(1);

    // Dynamic actions
    let actionBtn = '';
    if (bk.status === 'requested' || bk.status === 'approved') {
      actionBtn = `<button class="btn btn-secondary btn-sm" onclick="cancelBooking('${bk.sys_id}')" style="border-color: var(--status-booked); color: var(--status-booked);"><i class="fa-solid fa-ban"></i> Cancel</button>`;
    }

    tr.innerHTML = `
      <td><a href="javascript:void(0)" class="approval-number" onclick="viewBookingDetails('${bk.sys_id}')">${bk.number}</a></td>
      <td><strong>${facility ? facility.name : 'Unknown'}</strong></td>
      <td>${bk.booking_date}</td>
      <td>${slotsLabels}</td>
      <td><span style="font-size: 11px;">${bk.approver.split('@')[0]}</span></td>
      <td><span class="${badgeClass}">${displayStatus}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick="viewBookingDetails('${bk.sys_id}')"><i class="fa-solid fa-eye"></i> Details</button>
          ${actionBtn}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cancelBooking(sysId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  const booking = DB.bookings.find(b => b.sys_id === sysId);
  if (booking) {
    booking.status = 'cancelled';
    booking.comments = 'Cancelled by requester.';
    
    renderMyBookings();
    renderSlots();
    
    // Refresh approvals list in case it was pending
    if (typeof renderApprovalsList === 'function') {
      renderApprovalsList();
    }
    
    // Notify
    addNotification('Email Notification Sent', booking.approver, `Reservation request (${booking.number}) has been cancelled by the requester.`, 'email');
    showToast(`Booking ${booking.number} cancelled.`, 'info');
  }
}

// --- BOOKING DETAILS TICKET MODAL ---

function viewBookingDetails(sysId) {
  const booking = DB.bookings.find(b => b.sys_id === sysId);
  if (!booking) return;

  const facility = DB.facilities.find(f => f.id === booking.facility_id);
  const slotsDetail = booking.slots.map(sid => {
    const slot = DB.slots.find(s => s.id === sid);
    return slot ? slot.label : sid;
  }).join('<br>');

  const modal = document.getElementById('ticketModal');
  const title = document.getElementById('ticketModalTitle');
  const body = document.getElementById('ticketModalBody');

  title.innerHTML = `<i class="fa-solid fa-file-invoice text-primary"></i> ServiceNow Record: ${booking.number}`;
  
  let statusBadge = `<span class="badge badge-${booking.status}">${booking.status.toUpperCase()}</span>`;

  body.innerHTML = `
    <div class="ticket-row"><strong>Table Registry:</strong> <span>x_shbs_booking (Sports Reservation)</span></div>
    <div class="ticket-row"><strong>Sys ID:</strong> <span style="font-family: monospace; font-size:10px;">${booking.sys_id}</span></div>
    <div class="ticket-row"><strong>Requester:</strong> <span>${booking.requester} (${booking.department})</span></div>
    <div class="ticket-row"><strong>Facility:</strong> <span>${facility ? facility.name : 'Unknown'}</span></div>
    <div class="ticket-row"><strong>Scheduled Date:</strong> <span>${booking.booking_date}</span></div>
    <div class="ticket-row"><strong>Reserved Time Slots:</strong> <span style="text-align: right;">${slotsDetail}</span></div>
    <div class="ticket-row"><strong>Attendees:</strong> <span>${booking.attendees} players</span></div>
    <div class="ticket-row"><strong>Estimated Internal Fee:</strong> <span>$${booking.total_cost.toFixed(2)}</span></div>
    <div class="ticket-row"><strong>Assigned Approver:</strong> <span>${booking.approver}</span></div>
    <div class="ticket-row"><strong>Created On:</strong> <span>${booking.created_on}</span></div>
    <div class="ticket-row"><strong>Approval Status:</strong> <span>${statusBadge}</span></div>
    <div class="ticket-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
      <strong>Purpose / Reason:</strong>
      <div style="background-color: var(--bg-primary); padding: 8px; width: 100%; border-radius: 4px; font-size: 11px;">
        ${booking.purpose}
      </div>
    </div>
    ${booking.comments ? `
    <div class="ticket-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
      <strong>Workflow / Activity Comments:</strong>
      <div style="background-color: rgba(245, 158, 11, 0.05); border-left: 2px solid var(--status-pending); padding: 8px; width: 100%; border-radius: 4px; font-size: 11px;">
        ${booking.comments}
      </div>
    </div>
    ` : ''}
  `;

  modal.classList.remove('hidden');
}

function closeTicketModal() {
  document.getElementById('ticketModal').classList.add('hidden');
}

// --- THEME & NOTIFICATION MANAGEMENT ---

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggleBtn');
  
  if (body.classList.contains('light-theme')) {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    showToast('Dark mode activated', 'info');
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    showToast('Light mode activated', 'info');
  }
}

function toggleNotificationDrawer() {
  const drawer = document.getElementById('notificationDrawer');
  drawer.classList.toggle('open');
}

function addNotification(title, recipient, body, type = 'email') {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const newNotif = {
    title: title,
    recipient: recipient,
    body: body,
    timestamp: timestamp,
    type: type
  };

  DB.notifications.unshift(newNotif); // latest first
  
  // Render notification list
  renderNotificationDrawer();
  
  // Update badge count
  const badge = document.getElementById('notificationBadge');
  badge.textContent = DB.notifications.length;
}

function renderNotificationDrawer() {
  const body = document.getElementById('notificationDrawerBody');
  body.innerHTML = '';

  if (DB.notifications.length === 0) {
    body.innerHTML = '<div class="empty-state"><p>No system notifications logged in this session.</p></div>';
    return;
  }

  DB.notifications.forEach(notif => {
    const item = document.createElement('div');
    item.className = `notif-log-item ${notif.type}-notif`;
    
    let icon = notif.type === 'email' ? 'fa-regular fa-envelope' : 'fa-solid fa-comment-sms';
    let typeLabel = notif.type.toUpperCase() + ' DISPATCH';

    item.innerHTML = `
      <div class="notif-meta">
        <span><i class="${icon}"></i> ${typeLabel}</span>
        <span>${notif.timestamp}</span>
      </div>
      <div class="notif-title">${notif.title}</div>
      <div class="notif-recipients"><strong>To:</strong> ${notif.recipient}</div>
      <div class="notif-body-content">${notif.body}</div>
    `;
    body.appendChild(item);
  });
}

// --- UTILITY TOAST SYSTEM ---

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-solid fa-circle-check';
  if (type === 'error') icon = 'fa-solid fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-solid fa-triangle-exclamation';
  if (type === 'info') icon = 'fa-solid fa-circle-info';

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function refreshUIState() {
  // Syncs counts
  document.getElementById('myBookingsCount').textContent = DB.bookings.filter(b => b.requester === 'System Administrator').length;
}
