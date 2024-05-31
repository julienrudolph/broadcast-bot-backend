import { IConversationInit, IScimUserResponse } from '../interfaces/interfaces';

const scimToken = process.ENV.SCIM_TOKEN
const scimUrl = process.ENV.SCIM_URI

export const getUserRichInfosById = async (id: string):Promise<IScimUserResponse> => {
  return new Promise<IScimUserResponse>((resolve, reject) => {
    let user = fetch(
      scimUrl+"/Users/"+id,{
        headers: {'Accept': 'application/scim+json', 'Content-Type':'application/scim+json', 'Authorization': 'Bearer ' + scimToken},
      }).then((response) => {
      if(response.ok){
        response.json().then((data:IScimUserResponse) =>{
          if(data){
            resolve(data);
          }else{
            reject(data);
          }
        }).catch((error) => {
          reject();
        });
      }
    }).catch((error) => {
      reject(error);  
    });
  })
}

