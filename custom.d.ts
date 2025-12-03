declare module "*.css" {
  // This line tells TypeScript that any import ending in .css 
  // should be treated as a module that exports nothing, 
  // which is correct for a side-effect import.
  const content: any; 
  export default content;
}