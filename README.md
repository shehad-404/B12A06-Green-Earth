# B12A06-Green-Earth

---

## 📘 Q&A

### 1) What is the difference between var, let, and const?
- **var**
  - Function-scoped
  - Can be redeclared and updated
  - Hoisted (initialized as `undefined`)
- **let**
  - Block-scoped
  - Can be updated but not redeclared in the same scope
  - Hoisted but not initialized (Temporal Dead Zone)
- **const**
  - Block-scoped
  - Cannot be reassigned or redeclared
  - Must be initialized at declaration

---

### 2) What is the difference between map(), forEach(), and filter()?
- **map()**
  - Returns a **new array** with transformed elements
  - Example: `arr.map(x => x * 2)`
- **forEach()**
  - Iterates over an array but **does not return** anything
  - Example: `arr.forEach(x => console.log(x))`
- **filter()**
  - Returns a **new array** with elements that pass a condition
  - Example: `arr.filter(x => x > 5)`

---

### 3) What are arrow functions in ES6?
Arrow functions provide a shorter syntax for functions.  
They do not have their own `this` and inherit from the parent scope.

```js
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function
const addArrow = (a, b) => a + b;
