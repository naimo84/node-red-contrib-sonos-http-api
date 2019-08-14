'use strict';

export class SonosHelper 
{
    constructor() {
    }

    validateConfigNode(node, configNode)
    {
        if (configNode === undefined || configNode === null) {
            node.status({fill:"red", shape:"ring", text:"please select a config node"});
            return false;
        }
        
        var hasIpName = configNode.name !== undefined && configNode.name !== null && configNode.name.trim().length > 3;
        if (!hasIpName) {
            node.status({fill:"red", shape:"ring", text:"missing serial number or IP Address in config node"});
            return false;
        }

        //clear node status
        node.status({});
        return true;
    }

    preprocessInputMsg(node, configNode, msg, callback)
    {
        var isValid = this.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        
        if (callback)
            callback(configNode);
        return;        
    }
  

    handleSonosApiRequest(node, err, result, msg, successString, failureString)
    {
        if (err) {
            node.error(err);
            console.log(err);
            if (!failureString)
                failureString = "failed to execute request";
            node.status({fill:"red", shape:"dot", text:failureString});
            return;
        }

        msg.payload = result;

        if (!successString)
            successString = "request success";
        node.status({fill:"blue", shape:"dot", text:successString});
    }
}

export default SonosHelper;