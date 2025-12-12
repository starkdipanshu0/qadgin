export const getProductPrice = async (productId) => {
    try {
        const res = await fetch(`http://localhost:8000/products/${productId}`);
        const data = await res.json();
        return data.price;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
};
