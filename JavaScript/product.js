import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.27/vue.esm-browser.min.js';

let productModal = {};
let delProductModal = {};

const app = createApp({
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/v2',
            apiPath: 'zhang-hexschool',
            products: [],
            tempProduct: {
                imagesUrl: [],
            },
            isNew: false,
        };
    },
    methods: {
        //驗證是否登入
        loginCheck() {
            const url = `${this.apiUrl}/api/user/check`;
            axios.post(url)
                .then(() => {
                    this.getProducts();
                })//驗證成功 -> 執行 getData，渲染出產品列表
                .catch((error) => {
                    alert(error.data.message);//驗證失敗 -> 取得 message 的字串
                    window.location = 'index.html';//驗證失敗 -> 導回登入頁面
                })
        },
        //取得後台產品列表
        getProducts() {
            const url = `${this.apiUrl}/api/${this.apiPath}/admin/products/all`;
            axios.get(url)
                .then((response) => {
                    this.products = response.data.products;
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        
        openModal(status, product) {
            if (status === 'isNew') {
                this.tempProduct = { //重製結構
                    imagesUrl: [],
                }
                productModal.show();
                this.isNew = true; //如果是新的會新增
            } else if (status === 'edit') {
                this.tempProduct = { ...product };//外層使用淺拷貝就好--因為物件本身是傳參考，如果直接改product會影響本來的值
                productModal.show();
                this.isNew = false; //編輯頁會是舊的
            } else if (status === 'delete') {
                delProductModal.show();
                this.tempProduct = { ...product };//將item品項帶入
            }
        },
        updateProduct() {//addProduct->updateProduct讓新增和編輯都能重複使用
            let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
            let method ='post';
            if (!this.isNew) { //false
                url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
                method ='put';
            }

            axios[method](url, { data: this.tempProduct })//[]帶變數
                .then((response) => {
                    console.log(response);
                    this.getProducts();//更新是在伺服器更新，必須重新請求取得產品列表
                    productModal.hide();//將Model關掉
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        delProduct() {
            const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;

            axios.delete(url)
                .then((response) => {
                    console.log(response);
                    this.getProducts();//更新是在伺服器更新，必須重新請求取得產品列表
                    delProductModal.hide();//將Model關掉
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        }
    },
    mounted() {
        productModal = new bootstrap.Modal(document.getElementById('productModal'));
        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'));
        
        //取得Token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
        //有正確取得token，放入headers
        //console.log(token);
        axios.defaults.headers.common.Authorization = token;
        //如何夾帶驗證資訊過去呢？下次發送 axios 預設把 token 內容直接加到 headers 裡面
        this.loginCheck();//執行驗證

        
    }
})
app.mount('#app');