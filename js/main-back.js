//載入header
axios({
 method: 'get',
 url: './component/header-back.html',
 responseType: 'json'
})
 .then(function (response) {
  let newHeader = document.getElementsByTagName("header")[0];
  newHeader.innerHTML = response.data;
 });

//載入body
axios({
 method: 'get',
 url: './component/back-end-administratorLogin.html',
 responseType: 'json'
})
 .then(function (response) {
  let newBody = document.getElementsByTagName("main")[0];
  newBody.innerHTML = response.data;


  doMenuToggle();

  getAdminOrders()
  doAdminOrdersDeleteAll()
 });

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
//時間轉換
function formatTimestamp(timestamp) {
 const date = new Date(timestamp * 1000);

 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0'); // 0
 const day = String(date.getDate()).padStart(2, '0');

 return `${year}/${month}/${day}`;
}
// C3.js
function doChart(result) {
 let chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
   type: "pie",
   columns: result[0],
   colors: result[1]
  },
 });
}


const authorization = "R4fGFZB1ZcaPHSaDgpn3UprQR0k2";

// 訂單相關(管理者) 抓取
function getAdminOrders() {
 axios({
  method: 'get',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/admin/catus/orders',
  headers: {
   'authorization': authorization,
  },
 })
  .then(function (response) {
   let orderPageTable = document.getElementsByClassName("orderPage-table")[0];
   let orderPageTable_str = ``;
   let orderPageTableTop = `
     <thead>
       <tr>
         <th>訂單編號</th>
         <th>聯絡人</th>
         <th>聯絡地址</th>
         <th>電子郵件</th>
         <th>訂單品項</th>
         <th>訂單日期</th>
         <th>訂單狀態</th>
         <th>操作</th>
       </tr>
     </thead>
   `;
   let orderPageTableCenter = ``;
   response.data.orders.forEach((order) => {
    let paid = order.paid == true ? "已處理" : "未處理";
    console.log(paid);
    console.log(order);
    orderPageTableCenter = `
    <tr id=${order.id}>
      <td>${order.createdAt}</td>
      <td>
        <p>${order.user.name}</p>
        <p>${order.user.tel}</p>
      </td>
      <td>${order.user.address}</td>
      <td>${order.user.email}</td>
      <td>
        <p>${order.products[0].title}</p>
      </td>
      <td>${formatTimestamp(order.createdAt)}</td>
      <td class="orderStatus">
        <a href="#">${paid}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" value="刪除" />
      </td>
    </tr>
     `;

    orderPageTable_str += orderPageTableCenter
   })
   orderPageTable.innerHTML = orderPageTableTop + orderPageTable_str;
   doAdminOrdersPaid(response);
   doAdminOrdersDelete(response);

   doChart(doRatio(response))
  });
}

function doRatio(response) {
 const countMap = {};
 const countColor = {};
 let colorIndex = 0;
 const colors = ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
 response.data.orders.forEach((order) => {
  if (countMap[order.products[0].title]) {
   countMap[order.products[0].title]++;
  } else {
   countColor[order.products[0].title] = colors[colorIndex]
   colorIndex++;
   countMap[order.products[0].title] = 1;
  }
 });

 let result = Object.entries(countMap).map(([item, count]) => [item, count]);
 return [result, countColor];
}


// 訂單相關(管理者) 編輯狀態按鈕
function doAdminOrdersPaid(response) {
 response.data.orders.forEach((order) => {
  let orderStatus = document.getElementById(order.id).getElementsByClassName("orderStatus")[0].getElementsByTagName("a")[0];
  orderStatus.addEventListener("click", () => setAdminOrdersPaid(order.id, order.paid));
 })
}
// 訂單相關(管理者) 編輯狀態
function setAdminOrdersPaid(orderId, paid) {
 let clickPaid = paid == true ? false : true;
 axios({
  method: 'PUT',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/admin/catus/orders',
  headers: {
   'authorization': authorization,
  },
  data: {
   "data": {
    "id": orderId,
    "paid": clickPaid
   }
  },
 })
  .then(function () {
   getAdminOrders()
  });
}

// 訂單相關(管理者) 刪除全部訂單按鈕
function doAdminOrdersDeleteAll() {
 let discardAllBtn = document.getElementsByClassName("discardAllBtn")[0];
 discardAllBtn.addEventListener("click", () => setAdminOrdersDeleteAll());
}
// 訂單相關(管理者) 刪除全部訂單
function setAdminOrdersDeleteAll() {
 axios({
  method: 'DELETE',
  url: 'https://livejs-api.hexschool.io/api/livejs/v1/admin/catus/orders',
  headers: {
   'authorization': authorization,
  },
 })
  .then(function (response) {
   getAdminOrders()
  });
}

// 訂單相關(管理者) 刪除訂單按鈕
function doAdminOrdersDelete(response) {
 response.data.orders.forEach((order) => {
  let delSingleOrderBtn = document.getElementById(order.id).getElementsByClassName("delSingleOrder-Btn")[0];
  delSingleOrderBtn.addEventListener("click", () => setAdminOrdersPaid(order.id));
 })
}
// 訂單相關(管理者) 刪除訂單
function setAdminOrdersDelete(orderId) {
 axios({
  method: 'DELETE',
  url: `https://livejs-api.hexschool.io/api/livejs/v1/admin/catus/orders/${orderId}`,
  headers: {
   'authorization': authorization,
  },
 })
  .then(function (response) {
   getAdminOrders()
  });
}

