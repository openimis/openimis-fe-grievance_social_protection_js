import  React , { Component}  from  "react";
import {injectIntl} from 'react-intl';
import { ScreenShare } from "@material-ui/icons";
import {formatMessage, MainMenuContribution, withModulesManager  } from  "@openimis/fe-core";

class TicketMainMenu extends Component {
    render(){
        const { intl, modulesManager, rights } = this.props;
        let entries = [];

        // if (rights.includes(RIGHT_TICKET)) {
        //     entries.push({
        //       text: formatMessage(this.props.intl, "ticket", "menu.tickets"),
        //       icon: <Person />,
        //       route: "/" + modulesManager.getRef("ticket.route.tickets"),
        //     });
        // }
        
        if  (!entries.length) return null;
        return(
        <MainMenuContribution
            { ...this.props }
            header= {formatMessage(intl, "ticket", "mainMenu")}
            icon= {<ScreenShare />}
            entries ={entries}  
        />
        );

    }
}

export default withModulesManager(injectIntl(TicketMainMenu))