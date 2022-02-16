import '../assets/index.css';
import * as React from 'react';
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import { CalendarComponent } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { scheduleData } from '../assets/datasource';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { extend } from '@syncfusion/ej2-base';
import { SampleBase } from '../assets/sample-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
/**
 * Schedule Default sample
 */
export class Default extends SampleBase {
  constructor() {
    super(...arguments);
    this.data = extend([], scheduleData, null, true);
    this.dataOption =  [{ text: 'Type1', value: 'Type1' },
            { text: 'Type2', value: 'Type2' }]
             this.fields = { text: 'text', value: 'value' };
  }
  change(args) {
    // Date Change
    this.scheduleObj.selectedDate = args.value;
    this.scheduleObj.dataBind();
  }
  onFilterDataByType(args) {
    // Filtering the event based on Subject Type
    var dm  = new DataManager({json: this.data});
    var datasource =  dm.executeLocal(new Query().where('Subject', 'equal', args.value));
    this.scheduleObj.eventSettings.dataSource = datasource;
    this.scheduleObj.dataBind();
  }
  onViewChange(args) {
    // Schedule View Change
    this.scheduleObj.currentView = args.currentTarget.getAttribute('id');
    this.scheduleObj.dataBind();
  }
  render() {
    return (
    <div className='schedule-control-section'>
    <div className='control-section'>
      <div className='header'>
       <span className='dropSpan'>
         FilterBy: <DropDownListComponent width = '200px' style={{ padding: '6px'}} value={0} dataSource={this.dataOption} fields={this.fields}
            change={this.onFilterDataByType.bind(this)} popupWidth='200px'>
          </DropDownListComponent>
           </span>
          <span className='buttonSpan'>
          <ButtonComponent id='Day' value='Day' onClick={this.onViewChange.bind(this)}>Day</ButtonComponent>
          <ButtonComponent id='Week' value='Week' onClick={this.onViewChange.bind(this)}>Week</ButtonComponent>
          <ButtonComponent id='Month' value='Month' onClick={this.onViewChange.bind(this)}>Month</ButtonComponent>
          </span>
      </div>
      <div className='col-lg-3 property-section'>
        <CalendarComponent value={new Date(2018, 1, 15)}  change={this.change.bind(this)}></CalendarComponent>
      </div>
      <div className='col-lg-9 control-section'>
        <div className='control-wrapper'>
          <ScheduleComponent height='650px' readonly = {true} width='80%' ref={schedule => this.scheduleObj = schedule} selectedDate={new Date(2018, 1, 15)} eventSettings={{ dataSource: this.data }} currentView={Day} showHeaderBar={false}>
            <ViewsDirective>
              <ViewDirective option='Day' />
              <ViewDirective option='Week' />
              <ViewDirective option='WorkWeek' />
              <ViewDirective option='Month' />
              <ViewDirective option='Agenda' />
            </ViewsDirective>
            <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
          </ScheduleComponent>
        </div>
      </div>
      </div>
    </div>);
  }
}

export default Default;