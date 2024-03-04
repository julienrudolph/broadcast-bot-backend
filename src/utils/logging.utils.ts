export const log = async (
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
  message: string,
  otherProps: unknown = {},
  type: 'LOG' | 'HTTP' = 'LOG'
) => {
  let logMessage: Record<string, any> = {
    '@timestamp' : new Date().toISOString,
    message,
    level,
    type  
  }
  if(otherProps instanceof Error){
    logMessage['exception'] = errorToObject(otherProps);
  } else if(otherProps && typeof otherProps === 'object'){
    logMessage = {...logMessage, ...otherProps}
  } else if(typeof otherProps === 'string' || typeof otherProps === 'number'){
    logMessage['otherProps'] = otherProps
  }
  console.log(JSON.stringify(logMessage));
}

export const receiveJsonOrLogError = async (response: Response) => {
  if (response.ok && response.body) {
    return await response.json();
  }
  let body = await response.text();
  try {
    body = JSON.parse(body) ?? body;
  } catch (ignored) {
  }
  logWarn(`Request was not successful!`,
    { httpUrl: response.url, httpStatus: response.status, httpBody: body }
  );
  throw new Error(`Request to ${response.url} was not successful.`);
};

const errorToObject = (error: Error) => {
  const obj: Record<string, any> = {};
  Object.getOwnPropertyNames(error).forEach(function(propName) {
    obj[propName] = error[propName];
  });
  return obj;
}

export const logDebug = (
  message: string,
  otherProps: unknown = {}
) => log('DEBUG', message, otherProps, 'LOG');

export const logInfo = (
  message: string,
  otherProps: unknown = {}
) => log('INFO', message, otherProps, 'LOG');

export const logWarn = (
  message: string,
  otherProps: unknown = {}
) => log('WARN', message, otherProps, 'LOG');

export const logError = (
  message: string,
  otherProps: unknown = {}
) => log('ERROR', message, otherProps, 'LOG');

