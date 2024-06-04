//載入header
axios({
 method: 'get',
 url: './component/header-front.html',
 responseType: 'json'
})
 .then(function (response) {
  let newHeader = document.getElementsByTagName("header")[0];
  newHeader.innerHTML = response.data;
 });

//載入body
axios({
 method: 'get',
 url: './component/front-end.html',
 responseType: 'json'
})
 .then(function (response) {
  let newBody = document.getElementsByTagName("main")[0];
  newBody.innerHTML = response.data;

  getCustomerProducts();
  doCustomerProductsSelect();

  getCustomerCarts()


  doMenuToggle();

 });


//==============================================================================
//==============================================================================

const authorization = "R4fGFZB1ZcaPHSaDgpn3UprQR0k2";

// menu 切換
function doMenuToggle() {
 let menuOpenBtn = document.querySelector(".menuToggle");
 let linkBtn = document.querySelectorAll(".topBar-menu a");
 let menu = document.querySelector(".topBar-menu");
 menuOpenBtn.addEventListener("click", menuToggle);

 linkBtn.forEach((item) => {
  item.addEventListener("click", closeMenu);
 });

 function menuToggle() {
  if (menu.classList.contains("openMenu")) {
   menu.classList.remove("openMenu");
  } else {
   menu.classList.add("openMenu");
  }
 }
 function closeMenu() {
  menu.classList.remove("openMenu");
 }
}

//目前選擇
let productSelectOption;

//產品相關(客戶)
function getCustomerProducts() {
 axios({
  method: 'get',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/products',
  responseType: 'json'
 })
  .then(function (response) {
   let productWrap = document.querySelector(".productDisplay .productWrap");
   let productWrap_str = ``;

   response.data.products.forEach((product) => {
    let productWrapLi = `
    <li class="productCard" id="${product.id}">
      <h4 class="productType">${product.category}</h4>
      <img src="${product.images}" alt="img" />
      <a href="#" class="addCardBtn">加入購物車</a>
      <h3>${product.title}</h3>
      <del class="originPrice">NT$${product.origin_price}</del>
      <p class="nowPrice">NT$${product.price}</p>
    </li>
    `;
    if (productSelectOption === undefined || productSelectOption === product.category || productSelectOption === "全部") {
     productWrapLi;
    } else {
     return
    }
    productWrap_str += productWrapLi;
   })
   productWrap.innerHTML = productWrap_str;
   doCustomerCarts(response);
  });
}

//產品相關類別選擇
function doCustomerProductsSelect() {
 let productSelect = document.querySelector(".productDisplay .productSelect");
 productSelect.addEventListener("change", function (e) {
  productSelectOption = e.target.value;
  getCustomerProducts();
 })
}

//購物車相關(客戶) 抓取
function getCustomerCarts() {
 axios({
  method: 'get',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/carts',
  responseType: 'json'
 })
  .then(function (response) {
   // console.log(response);
   let shoppingCartTable = document.querySelector(".shoppingCart .shoppingCart-table");
   let shoppingCartTable_str = ``;
   let shoppingCartTableTrTop = `
     <tr>
       <th width="40%">品項</th>
       <th width="15%">單價</th>
       <th width="15%">數量</th>
       <th width="15%">金額</th>
       <th width="15%"></th>
     </tr>
   `;
   let shoppingCartTableTrCenter = ``;
   let price = 0;
   let shoppingCartTableTrBottom = ``;
   if (response.data.carts.length > 0) {
    response.data.carts.forEach((product) => {
     let shoppingCartTableTrCenter_in = `
        <tr id=${product.id}>
          <td>
            <div class="cardItem-title">
              <img src=${product.product.images} alt="img" />
              <p>${product.product.title}</p>
            </div>
          </td>
          <td>NT$${product.product.origin_price}</td>
          <td>1</td>
          <td>NT$${product.product.price}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons"> clear </a>
          </td>
        </tr>
     `;
     shoppingCartTableTrCenter += shoppingCartTableTrCenter_in;
     price += product.product.price;
    })
    shoppingCartTableTrBottom = `
    <tr>
       <td>
         <a href="#" class="discardAllBtn">刪除所有品項</a>
       </td>
       <td></td>
       <td></td>
       <td>
         <p>總金額</p>
       </td>
       <td>NT$${price}</td>
    </tr>
    `;
   } else {
    shoppingCartTableTrBottom = ``;
   }
   shoppingCartTable_str = shoppingCartTableTrTop + shoppingCartTableTrCenter + shoppingCartTableTrBottom;
   shoppingCartTable.innerHTML = shoppingCartTable_str;

   doDeleteCustomerCarts(response)
   doDeleteAllCustomerCarts()
   doCustomerOrders()
  });
}

//加入購物車按鈕
function doCustomerCarts(response) {
 response.data.products.forEach((product) => {
  let addCardBtn = document.getElementById(product.id).getElementsByClassName("addCardBtn")[0];
  addCardBtn.addEventListener("click", () => setCustomerCarts(product.id));
 })
}

//購物車相關(客戶) 新增放入購物車
function setCustomerCarts(productId) {
 console.log(productId);
 axios({
  method: 'post',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/carts',
  data: {
   data: {
    "productId": productId,
    "quantity": 1
   }
  }
 })
  .then(function (response) {
   getCustomerCarts()
  });
}

//刪除購物車按鈕 全部
function doDeleteAllCustomerCarts() {
 let discardAllBtn = document.getElementsByClassName("discardAllBtn")[0];
 if (discardAllBtn) {
  discardAllBtn.addEventListener("click", () => setDeleteAllCustomerCarts());
 }
}
//購物車相關(客戶) 刪除購物車按鈕 全部
function setDeleteAllCustomerCarts() {
 axios({
  method: 'DELETE',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/carts',
 })
  .then(function (response) {
   getCustomerCarts()
  });
}

//刪除購物車按鈕 特定
function doDeleteCustomerCarts(response) {
 response.data.carts.forEach((product) => {
  let discardBtn = document.getElementById(product.id).getElementsByClassName("discardBtn")[0].getElementsByClassName("material-icons")[0];
  discardBtn.addEventListener("click", () => setDeleteCustomerCarts(product.id));
 })
}
//購物車相關(客戶) 刪除購物車按鈕 特定
function setDeleteCustomerCarts(productId) {
 axios({
  method: 'DELETE',
  url: `https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/carts/${productId}`,
 })
  .then(function (response) {
   getCustomerCarts()
  });
}


//訂單相關按鈕 送出預訂資料
function doCustomerOrders() {
 let orderInfoBtn = document.getElementsByClassName("orderInfo-btn")[0];
 orderInfoBtn.addEventListener("click", () => setCustomerOrders());
}
//訂單相關(客戶)
function setCustomerOrders() {
 let formData = {
  customerName: document.getElementById("customerName").value,
  customerPhone: document.getElementById("customerPhone").value,
  customerEmail: document.getElementById("customerEmail").value,
  customerAddress: document.getElementById("customerAddress").value,
  tradeWay: document.getElementById("tradeWay").value,
 };
 function validate({ customerName, customerPhone, customerEmail, customerAddress, tradeWay }) {
  const usernamePattern = /^[a-zA-Z0-9_-]{3,16}$/;
  const phonePattern = /^(\d{2,4}-\d{6,8}|\d{4}-\d{6,8})$/;
  const customerEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (customerName === "") {
   alert("請輸入姓名");
   return false;
  }
  if (!usernamePattern.test(customerName)) {
   alert("姓名格式錯誤，3-6字");
   return false;
  }
  if (customerPhone === "") {
   alert("請輸入電話");
   return false;
  }
  if (!phonePattern.test(customerPhone)) {
   alert("電話格式錯誤，例：0912-345678");
   return false;
  }
  if (loginEmail === "") {
   alert("請輸入信箱");
   return false;
  }
  if (!customerEmailRegex.test(customerEmail)) {
   alert("信箱格式錯誤，例：example@example.com");
   return false;
  }
  if (customerAddress === "") {
   alert("請輸入地址");
   return false;
  }
  if (tradeWay === "") {
   alert("請輸選擇付款方式");
   return false;
  }
  return true;
 }
 const validData = validate(formData);
 if (!validData) return;

 axios({
  method: 'POST',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/catus/orders',
  headers: {
   'accept': 'application/json',
   'Content-Type': 'application/json',
   'authorization': authorization,
  },
  data: {
   "data": {
    "user": {
     "name": formData.customerName,
     "tel": formData.customerPhone,
     "email": formData.customerEmail,
     "address": formData.customerAddress,
     "payment": formData.tradeWay
    }
   }
  }
 })
  .then(function (response) {
   console.log(5465);
   console.log(response);
   if (response.status === 200) {
    alert("下單成功")
   }
  })
  .catch(function (error) {
   console.error(error);
  });
 ;
}