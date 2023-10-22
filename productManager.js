// ---------------------- CLASE PRODUCTMANAGER ---------------------------

const { log } = require('console');
const { promises: fs } = require('fs')

class ProductManager {
    #products;
    #proxIdCode = 1;

    constructor({path}) {
        this.path = path;
        this.#products = [];
    }

    getCodeAutoincremental() {
        return this.#proxIdCode++;
    }

    async #readProducts() {
        const productosEnJson = await fs.readFile(this.path, 'utf-8');
        const datosArrayProductos = JSON.parse(productosEnJson);
        this.#products = datosArrayProductos.map(p => new Producto(p));
      }

    async #writeProducts() {
        const productsJson = JSON.stringify(this.#products, null, 2);
        await fs.writeFile(this.path, productsJson);
    }

    async reset() {
        this.#products = [];
        await this.#writeProducts();
      }

    async addProduct({title, description, price, thumbnail, stock}) {
        await this.#readProducts ();
        const idCode = this.getCodeAutoincremental();
        const validacion = this.#products.some(producto => producto.getCode() === idCode);

        if (validacion) {
            throw new Error("Código Repetido");
        } else {
            const productos = new Producto({ 
                title: title, 
                description: description, 
                price: price, 
                thumbnail: thumbnail, 
                stock: stock, 
                code: idCode 
            });
            this.#products.push(productos);
            await this.#writeProducts();
            return productos;
        }
    }

    async getProducts() {
        await this.#readProducts();;
        return this.#products.map(producto => ({ code: producto.getCode(), ...producto }));
    }

    async getProductById(idCode) {
        await this.#readProducts ();
        const producto = this.#products.find(e => e.getCode() === idCode);
        if (!producto) {
            throw new Error("Not found");
        } else {
            return producto;
        }
    }

    async updateProduct(idCode, productData) {
        await this.#readProducts();
        const productIndex = this.#products.findIndex(e => e.getCode() === idCode);
        if (productIndex !== -1) {
            const updatedProduct = new Producto({...this.#products[productIndex].toJSON(), ...productData});
            this.#products[productIndex] = updatedProduct;
            await this.#writeProducts();
            return updatedProduct.toJSON();
        } else {
            throw new Error("La Actualización Falló: Producto No Encontrado");
        }
    }
    

    async deleteProduct (idCode){
        await this.#readProducts()
        const productIndex = this.#products.findIndex(e => e.getCode() === idCode);
        if (productIndex !== -1) {
            const deleteProduct = this.#products.splice(productIndex, 1)[0];
            await this.#writeProducts();
            return deleteProduct.toJSON();
        }
        else{
            throw new Error("La Eliminación Falló: Producto No Encontrado");
        }
    }
}

// -------------------------------- CLASE PRODUCTO -----------------------------------

class Producto {
    #code;
    title;
    description;
    price;
    thumbnail;
    stock;

    constructor({ title, description, price, thumbnail, stock, code }) {
        this.#code = code;
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.stock = stock;
        if (title === undefined || description === undefined || price === undefined || thumbnail === undefined || stock === undefined) {
            throw new Error("Los campos son OBLIGATORIOS!");
        }
    }

    getCode() {
        return this.#code;
    }
    
    // CLASE CREADA PARA QUE SE VEA EL CODIGO DE PRODUCTO EN JSON

    toJSON() {
        return {
            code: this.#code,
            title: this.title,
            description: this.description,
            price: this.price,
            thumbnail: this.thumbnail,
            stock: this.stock
        };
    
}};
    
//----------------------------------- PRUEBAS ---------------------------------------------

async function main () {

    // ----------------- CREANDO PRODUCTO 1 y 2 ------------------
    const mng = new ProductManager ({path: "./productos.json"});
    // mng.reset() //(COMENTADO POR QUE RESTAURA LOS ESTADOS A 0)
    
    console.log("Agregado: ", await mng.addProduct ({
        title: "Azucar",//(nombre del producto)
        description: "Azucar",//(descripción del producto)
        price: 700, //(precio)
        thumbnail: "Pepito.com", //(ruta de imagen)
        stock: 50 //(número de piezas disponibles) 
    }));

    console.log("Agregado: ", await mng.addProduct ({
        title: "Pan",//(nombre del producto)
        description: "Pan",//(descripción del producto)
        price: 750, //(precio)
        thumbnail: "Pepito.com", //(ruta de imagen)
        stock: 55 //(número de piezas disponibles) 
    }));

    // // -------- PRUEBA LISTA DE PRODUCTOS EN JSON---------- 

    console.log("Obtenidos: ", await mng.getProducts());

    // //-------- PRUEBA BUSQUEDA DE PRODUCTO POR CODE ----------

    console.log("Producto Encontrado: ", await mng.getProductById(2));

    // //-------- ACTUALIZANDO PRODUCTOS DEL JSON -----------

    console.log("Producto Actualizado: ", await mng.updateProduct(1, {price: 520}));

    // // --------- ELIMINANDO PRODUCTOS DEL JSON ------------

    console.log("Producto Actualizado: ", await mng.deleteProduct(1));

    // // -------- PRUEBA LISTA DE PRODUCTOS FINAL CON ELIMINACION EN JSON---------- 

    console.log("Obtenidos: ", await mng.getProducts());

}

main();


// ------------------------ COMANDO NODE : node productManager.js ------------------------------