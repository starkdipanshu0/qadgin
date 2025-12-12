declare module 'razorpay' {
    export interface RazorpayOptions {
        key_id: string;
        key_secret: string;
        headers?: Record<string, string>;
    }

    export interface Orders {
        create(options: any): Promise<any>;
        fetch(orderId: string): Promise<any>;
        all(options?: any): Promise<any>;
    }

    export class Razorpay {
        constructor(options: RazorpayOptions);
        orders: Orders;
        // Add other properties as needed
    }

    export default Razorpay;
}
