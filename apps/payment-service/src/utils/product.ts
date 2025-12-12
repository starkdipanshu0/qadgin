
export const getProductPrice = async (productId: number) => {
    try {
        const res = await fetch(`http://localhost:8000/products/${productId}`);
        const data: any = await res.json();
        return data.price;
    } catch (error) {
        console.log(error);
        return 0;
    }
};
