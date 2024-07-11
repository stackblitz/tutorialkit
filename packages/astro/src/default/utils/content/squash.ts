export function squash<T extends Record<any, any>>(objects: (T | undefined)[], properties: (keyof T)[]) {
  const newObject = {} as any;

  for (const property of properties) {
    for (const object of objects) {
      if (object?.hasOwnProperty(property)) {
        if (property in newObject) {
          newObject[property] = inheritProperties(newObject[property], object[property]);
        } else {
          // if the property is new, we can just assign it
          newObject[property] = object[property];
        }
      }
    }
  }

  return newObject;
}

function inheritProperties(child: any, parent: any) {
  // if neither the parent nor the child are a POJO, then we do not inherit anything
  if (typeof parent !== 'object' || typeof child !== 'object' || Array.isArray(parent) || Array.isArray(child)) {
    return child;
  }

  const newObject = { ...parent };

  for (const property in child) {
    if (property in parent) {
      newObject[property] = inheritProperties(child[property], parent[property]);
    } else {
      newObject[property] = child[property];
    }
  }

  return newObject;
}
