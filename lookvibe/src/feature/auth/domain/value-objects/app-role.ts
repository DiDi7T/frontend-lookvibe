//Define un tipo de TypeScript estricto con los roles válidos del sistema 
// (cliente, negocio, estilista, admin), 
// evitando que se metan strings incorrectos por accidente por accidente en el código.
export type AppRole = 'cliente' | 'negocio' | 'estilista' | 'admin';