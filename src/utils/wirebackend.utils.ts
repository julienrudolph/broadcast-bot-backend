import { IConversationInit, IScimUserResponse } from '../interfaces/interfaces';

const scimToken = "9ferq+YwJl+IHBSTWwanMDohVFWYZ5rh4Yqa852ctz4="
const scimUrl = "https://prod-nginz-https.wire.com/scim/v2"

export const getUserRichInfosById = async (id: string) => {
  let content = '';
  await fetch(
    scimUrl,{
      headers: {'Accept': 'application/json', 'Content-Type':'application/json'},
      body: JSON.stringify(content)
    }
  ).then(repsonse => (response:IScimUserResponse) => {
    return repsonse;
  })
}