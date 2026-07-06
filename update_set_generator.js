/* ==========================================================================
   ServiceNow Update Set Generator (update_set_generator.js)
   Compiles and downloads standard sys_remote_update_set.xml payloads
   ========================================================================== */

function compileUpdateSetXml() {
  const currentDateStr = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  // Clean representation of ServiceNow Update Set XML file
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="${currentDateStr}">
  <sys_remote_update_set action="INSERT_OR_UPDATE">
    <application display_value="Global">global</application>
    <description>Sports Hall Booking System Service Portal widgets, schemas, rules and flows.</description>
    <name>Sports Hall Booking System - Portals &amp; Configurations</name>
    <release_date/>
    <state>loaded</state>
    <sys_class_name>sys_remote_update_set</sys_class_name>
    <sys_created_by>admin</sys_created_by>
    <sys_created_on>${currentDateStr}</sys_created_on>
    <sys_id>8efca100c3b01110bf554191d8402844</sys_id>
    <sys_mod_count>0</sys_mod_count>
    <sys_updated_by>admin</sys_updated_by>
    <sys_updated_on>${currentDateStr}</sys_updated_on>
    <update_set display_value="Sports Hall Booking System">56bca100c3b01110bf554191d840280f</update_set>
    <update_source display_value="Local Instance">https://dev109283.service-now.com</update_source>
  </sys_remote_update_set>

  <!-- Update XML 1: Table - x_shbs_sports_hall -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sys_db_object_x_shbs_sports_hall</name>
    <payload><![CDATA[<record_update table="sys_db_object">
  <sys_db_object action="INSERT_OR_UPDATE">
    <access>public</access>
    <actions_access>true</actions_access>
    <alter_access>true</alter_access>
    <client_scripts_access>true</client_scripts_access>
    <create_access>true</create_access>
    <delete_access>true</delete_access>
    <is_extendable>false</is_extendable>
    <label>Sports Hall Facility</label>
    <name>x_shbs_sports_hall</name>
    <read_access>true</read_access>
    <sys_class_name>sys_db_object</sys_class_name>
    <sys_id>bf3ea100c3b01110bf554191d84028cc</sys_id>
    <sys_name>Sports Hall Facility</sys_name>
    <update_access>true</update_access>
  </sys_db_object>
</record_update>]]></payload>
    <target_name>x_shbs_sports_hall</target_name>
    <type>Table</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>

  <!-- Update XML 2: Table - x_shbs_booking -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sys_db_object_x_shbs_booking</name>
    <payload><![CDATA[<record_update table="sys_db_object">
  <sys_db_object action="INSERT_OR_UPDATE">
    <access>public</access>
    <actions_access>true</actions_access>
    <alter_access>true</alter_access>
    <client_scripts_access>true</client_scripts_access>
    <create_access>true</create_access>
    <delete_access>true</delete_access>
    <is_extendable>false</is_extendable>
    <label>Sports Reservation</label>
    <name>x_shbs_booking</name>
    <read_access>true</read_access>
    <sys_class_name>sys_db_object</sys_class_name>
    <sys_id>5b7fa100c3b01110bf554191d84028ad</sys_id>
    <sys_name>Sports Reservation</sys_name>
    <update_access>true</update_access>
  </sys_db_object>
</record_update>]]></payload>
    <target_name>x_shbs_booking</target_name>
    <type>Table</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>

  <!-- Update XML 3: Dictionary - x_shbs_booking.status choice field -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sys_dictionary_x_shbs_booking_status</name>
    <payload><![CDATA[<record_update table="sys_dictionary">
  <sys_dictionary action="INSERT_OR_UPDATE" element="status" table="x_shbs_booking">
    <active>true</active>
    <choice>3</choice>
    <choice_field/>
    <choice_table/>
    <column_label>Status</column_label>
    <default_value>requested</default_value>
    <element>status</element>
    <mandatory>true</mandatory>
    <max_length>40</max_length>
    <name>x_shbs_booking</name>
    <read_only>false</read_only>
    <sys_class_name>sys_dictionary</sys_class_name>
    <sys_id>afbfa100c3b01110bf554191d84028f8</sys_id>
    <type display_value="Choice">choice</type>
  </sys_dictionary>
</record_update>]]></payload>
    <target_name>x_shbs_booking.status</target_name>
    <type>Dictionary</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>

  <!-- Update XML 4: Choice List Options for Status -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sys_choice_x_shbs_booking_status</name>
    <payload><![CDATA[<record_update table="sys_choice">
  <sys_choice action="INSERT_OR_UPDATE" field="status" table="x_shbs_booking" language="en">
    <sys_choice_set action="INSERT_OR_UPDATE">
      <element>status</element>
      <name>x_shbs_booking</name>
      <sys_class_name>sys_choice_set</sys_class_name>
      <sys_id>5fbfd100c3b01110bf554191d84028a2</sys_id>
    </sys_choice_set>
    <sys_choice action="INSERT_OR_UPDATE">
      <dependent_value/>
      <hint/>
      <inactive>false</inactive>
      <label>Requested</label>
      <language>en</language>
      <name>x_shbs_booking</name>
      <sequence>0</sequence>
      <sys_created_by>admin</sys_created_by>
      <value>requested</value>
    </sys_choice>
    <sys_choice action="INSERT_OR_UPDATE">
      <dependent_value/>
      <hint/>
      <inactive>false</inactive>
      <label>Approved</label>
      <language>en</language>
      <name>x_shbs_booking</name>
      <sequence>1</sequence>
      <sys_created_by>admin</sys_created_by>
      <value>approved</value>
    </sys_choice>
    <sys_choice action="INSERT_OR_UPDATE">
      <dependent_value/>
      <hint/>
      <inactive>false</inactive>
      <label>Rejected</label>
      <language>en</language>
      <name>x_shbs_booking</name>
      <sequence>2</sequence>
      <sys_created_by>admin</sys_created_by>
      <value>rejected</value>
    </sys_choice>
    <sys_choice action="INSERT_OR_UPDATE">
      <dependent_value/>
      <hint/>
      <inactive>false</inactive>
      <label>Cancelled</label>
      <language>en</language>
      <name>x_shbs_booking</name>
      <sequence>3</sequence>
      <sys_created_by>admin</sys_created_by>
      <value>cancelled</value>
    </sys_choice>
  </sys_choice>
</record_update>]]></payload>
    <target_name>x_shbs_booking.status</target_name>
    <type>Choice List</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>

  <!-- Update XML 5: Service Portal Widget - sp_widget_sports_hall_booking -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sp_widget_52af1040c3b01110bf554191d84028df</name>
    <payload><![CDATA[<record_update table="sp_widget">
  <sp_widget action="INSERT_OR_UPDATE">
    <client_script><![CDATA[
function WidgetController($scope, spUtil) {
  var c = this;
  c.selectFacility = function(id) {
    c.data.selectedFacility = id;
    c.server.update();
  };
  
  c.submitBooking = function() {
    c.server.get({
      action: 'create_booking',
      facility: c.data.selectedFacility,
      date: c.data.bookingDate,
      slots: c.data.selectedSlots,
      purpose: c.data.purpose
    }).then(function(r) {
      spUtil.addInfoMessage("Booking Submitted Successfully: " + r.data.number);
    });
  };
}
]]]]><![CDATA[></client_script>
    <controller_as>c</controller_as>
    <css>
      .facility-card { border: 1px solid #ccc; padding: 15px; cursor: pointer; }
      .facility-card.selected { border-color: #27856a; background-color: #f4faf8; }
      .slot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .slot-box.booked { background-color: #fee2e2; color: #ef4444; cursor: not-allowed; }
    </css>
    <data_table>sp_instance</data_table>
    <demo_data/>
    <description>Custom Booking Widget for Sports Hall Scheduler.</description>
    <docs/>
    <field_list/>
    <has_preview>true</has_preview>
    <id>widget-shbs-booking</id>
    <internal>false</internal>
    <link><![CDATA[function link(scope, element, attrs, controller) {  }]]></link>
    <name>Sports Hall Booking Widget</name>
    <option_schema/>
    <public>false</public>
    <roles/>
    <script><![CDATA[
(function() {
  data.facilities = [];
  var grFac = new GlideRecord('x_shbs_sports_hall');
  grFac.addQuery('status', 'operational');
  grFac.query();
  while(grFac.next()) {
    data.facilities.push({
      id: grFac.getValue('sys_id'),
      name: grFac.getValue('name'),
      rate: grFac.getValue('hourly_rate')
    });
  }

  if (input && input.action === 'create_booking') {
    var grBk = new GlideRecord('x_shbs_booking');
    grBk.initialize();
    grBk.facility = input.facility;
    grBk.booking_date = input.date;
    grBk.slots = input.slots.join(',');
    grBk.purpose = input.purpose;
    grBk.status = 'requested';
    var newId = grBk.insert();
    
    // Return booking number to client controller
    var checkBk = new GlideRecord('x_shbs_booking');
    checkBk.get(newId);
    data.number = checkBk.getValue('number');
  }
})();
]]]]><![CDATA[></script>
    <servicenow>false</servicenow>
    <sys_class_name>sp_widget</sys_class_name>
    <sys_id>52af1040c3b01110bf554191d84028df</sys_id>
    <sys_name>Sports Hall Booking Widget</sys_name>
    <template><![CDATA[
<div class="panel panel-default">
  <div class="panel-heading">Sports Hall Scheduling</div>
  <div class="panel-body">
    <div class="row">
      <div class="col-md-4" ng-repeat="f in data.facilities">
        <div class="facility-card" ng-class="{'selected': c.data.selectedFacility == f.id}" ng-click="c.selectFacility(f.id)">
          <h4>{{f.name}}</h4>
          <span>\${{f.rate}} / hour</span>
        </div>
      </div>
    </div>
  </div>
</div>
]]></template>
  </sp_widget>
</record_update>]]></payload>
    <target_name>Sports Hall Booking Widget</target_name>
    <type>Widget</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>

  <!-- Update XML 6: Access Control List (ACL) - read booking -->
  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>sys_security_acl_14cf1040c3b01110bf554191d84028ea</name>
    <payload><![CDATA[<record_update table="sys_security_acl">
  <sys_security_acl action="INSERT_OR_UPDATE">
    <active>true</active>
    <admin_overrides>true</admin_overrides>
    <description>Grant read access to bookings for owner or team lead.</description>
    <name>x_shbs_booking</name>
    <operation display_value="read">read</operation>
    <script><![CDATA[
// Allow requester to view own, or approver to view requested
answer = (current.requester == gs.getUserID() || current.approver == gs.getUserID() || gs.hasRole('x_shbs.admin'));
]]]]><![CDATA[></script>
    <sys_class_name>sys_security_acl</sys_class_name>
    <sys_id>14cf1040c3b01110bf554191d84028ea</sys_id>
    <sys_name>x_shbs_booking</sys_name>
    <type display_value="record">record</type>
  </sys_security_acl>
</record_update>]]></payload>
    <target_name>x_shbs_booking</target_name>
    <type>Access Control</type>
    <update_set display_value="Sports Hall Booking System">8efca100c3b01110bf554191d8402844</update_set>
  </sys_update_xml>
</unload>`;

  return xml;
}

function renderUpdateSetPreview() {
  const container = document.getElementById('updateSetXmlPreview');
  if (!container) return;

  const fullXml = compileUpdateSetXml();
  
  // Cut first 25 lines
  const lines = fullXml.split('\n');
  const preview = lines.slice(0, 25).join('\n') + '\n\n... [Contained XML definitions continue with Dictionary, Choices, Widgets, and ACL definitions] ...';

  container.textContent = preview;
}

function downloadUpdateSetXml() {
  try {
    const xmlContent = compileUpdateSetXml();
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
    
    // Create download link element
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'sports_hall_booking_system_update_set.xml');
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('XML Update Set file generated successfully!', 'success');
  } catch (err) {
    showToast('Failed to compile Update Set: ' + err.message, 'error');
  }
}
