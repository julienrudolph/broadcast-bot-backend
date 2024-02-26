import { IConversationInit, IScimUserResponse } from '../interfaces/interfaces';

const scimToken = "9ferq+YwJl+IHBSTWwanMDohVFWYZ5rh4Yqa852ctz4="
const scimUrl = "https://prod-nginz-https.wire.com/scim/v2"

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

