import Product from '../products/product.model.js'

export const createProducts = async () => {
    try {
        const existProduct = await Product.find({ name: { $in: ["Bitcoin", "Dolares","BOTZ","VOO"] }});


        if (existProduct.length < 4) {  
            const Bitcoin = new Product({
                name: "Bitcoin",
                description: "La criptomoneda mas utilizada del mundo",
                price: 118171.00,
                asset:true,
                image: "https://news-cdn.softpedia.com/images/news2/bitcoin-prices-hit-all-time-high-it-s-now-worth-more-than-gold-513510-2.jpg",
                status: true,
            });

            await Bitcoin.save();

            const Dolares = new Product({
                name: "Dolares",
                description: "La moneda mas utilizada del mundo",
                price: 7.56,
                asset:true,
                image: "https://tse4.mm.bing.net/th/id/OIP.tpxYYFSUST5DlA37iQWLywHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
                status: true,
            });

            await Dolares.save();

            const BOTZ = new Product({
                name: "BOTZ",
                description: "Global X Robotics & Artificial Intelligence ETF (BOTZ)",
                price: 32.27,
                asset:true,
                image: "https://yulon.co.kr/wp-content/uploads/2023/08/BOTZ-%EC%8D%B8%EB%84%A4%EC%9D%BC.png",
                status: true,
            });

            await BOTZ.save();

            const VOO = new Product({
                name: "VOO",
                description: "Vanguard S&P 500 ETF (VOO)",
                price: 573.22,
                asset:true,
                image: "https://pictureperfectportfolios.com/wp-content/uploads/2024/01/voo-etf-vanguard-s-p-500-fund-logo-700x419.jpg.webp",
                status: true,
            });

            await VOO.save();           
        }
    } catch (error) {
        console.error("Error creating products:", error);
    }
};
