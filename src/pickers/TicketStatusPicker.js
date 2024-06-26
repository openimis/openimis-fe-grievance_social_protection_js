/* eslint-disable react/jsx-props-no-spreading */
import React, { Component } from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

import { TICKET_STATUS } from '../constants';

// eslint-disable-next-line react/prefer-stateless-function
class TicketStatusPicker extends Component {
  render() {
    const {
      readOnly = false,
      value,
      onChange,
    } = this.props;

    return (
      <ConstantBasedPicker
        module="grievance"
        label="Ticket Status"
        constants={TICKET_STATUS}
        readOnly={readOnly}
        value={value}
        onChange={(option) => onChange(option, option ? `${option}` : null)}
        {...this.props}
      />
    );
  }
}

export default TicketStatusPicker;
