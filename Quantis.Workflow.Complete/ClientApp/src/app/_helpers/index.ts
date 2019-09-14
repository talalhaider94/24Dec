export * from './error-interceptor.service';
export * from './token-interceptor.service';
export * from './workflow';
export * from './date-time.service';
export * from './widgetsHelper';

export function removeNullKeysFromObject(obj) {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== 'date' && obj[key] && typeof obj[key] === "object") {
        newObj[key] = removeNullKeysFromObject(obj[key]); // recurse
      } else if (obj[key] !== null && obj[key] !== undefined) {
        newObj[key] = obj[key]; // copy value
      }
    });
    return newObj;
} 
