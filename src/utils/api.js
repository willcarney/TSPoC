define([
    "dojo/_base/declare","./src/utils/utils.js", 
  ], function (declare,utils) {
    var clazz = declare(null, {

        tokenGenerator: async function (){
            try {
              console.log("GENERATING NEW TOKEN")
              let configResponse = await fetch('config.json');
              let config = await configResponse.json();
              let baseURL = `https://${config.api.serverpath}.INRIX.com/traffic/Inrix.ashx?Action=GetSecurityToken`;

              let params = `&consumerId=${config.api.consumer_id}&vendorId=${config.api.vendor_id}&format=json`;
          
              let call = baseURL + params;

              console.log(call)
              let response = await utils().getData(call);

              console.log("SUCESS", response.result.token)
              return response.result.token;
              
            } catch (error) {
              console.error(error);
              // You may want to throw the error here to propagate it up to the caller.
            }
          },
    });

    return clazz;
  });
