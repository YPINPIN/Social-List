const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = '/api/v1/users/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
// 關鍵字搜尋的列表
let filteredUsers = []
// 一頁顯示的數量
const USER_PER_PAGE = 18
// 當前頁面
let currentPage = 1
// 收藏 data
const favoriteList = JSON.parse(localStorage.getItem('favoriteUser')) || []

// User Modal
const userModal = document.querySelector('#user-modal')
const modalContent = document.querySelector(
  '#user-modal .modal-dialog .modal-content'
)

// 列表顯示
function renderSocialList(data) {
  let rawHTML = ''
  data.forEach((user) => {
    const btnType = user.gender === 'male' ? 'btn-male' : 'btn-female'
    const bIsFavorite = favoriteList.some((item) => item.id === user.id)
    const btnFavorite = !bIsFavorite
      ? 'btn-action-favorite'
      : 'btn-action-favorite-fill'
    const iconHeart = !bIsFavorite ? 'bi-heart' : 'bi-heart-fill'
    rawHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-2 my-2 user-block">
        <div class="card border-0 p-0">
          <div class="card-body p-0 text-center">
            <button
              href="#"
              class="btn btn-show-user ${btnType} w-100 p-0 m-0"
              data-toggle="modal"
              data-target="#user-modal"
              data-id="${user.id}"
            >
              <img
                src=${user.avatar}
                class="card-img-top"
                alt="user-avatar"
                data-id="${user.id}"
              />
              ${user.name}
              <br />
              ${user.surname}
            </button>
            <div class="card-action mt-1">
              <a class="mailto-link" href="mailto:${user.email}">
                <i
                  class="btn-action btn-action-mailto bi bi-envelope m-2"
                ></i>
              </a>
              <i class="btn-action ${btnFavorite} bi ${iconHeart} m-2" data-id=${user.id}></i>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 分頁顯示
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  // 是否有搜尋資料
  const data = filteredUsers.length ? filteredUsers : favoriteList
  //計算起始 index
  const startIndex = (page - 1) * USER_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

// User點擊
function onPanelClicked(event) {
  if (
    event.target.matches('.btn-show-user') ||
    event.target.matches('.card-img-top')
  ) {
    showUserInfo(Number(event.target.dataset.id))
  } else if (
    event.target.matches('.btn-action-favorite') ||
    event.target.matches('.btn-action-favorite-fill')
  ) {
    btnFavoriteClicked(Number(event.target.dataset.id))
  }
}

// 顯示User資訊
function showUserInfo(id) {
  renderLoadingSpin(modalContent)
  axios
    .get(BASE_URL + INDEX_URL + id)
    .then((response) => {
      renderUserModalInfo(response.data)
    })
    .catch((err) => {
      console.log(err)
    })
}

// 顯示Loading
function renderLoadingSpin(target) {
  target.innerHTML = `
    <div class="w-100 d-flex justify-content-center align-items-center">
      <div class="spinner-grow text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <span class="m-3 text-info">Data Downloading...</span>
    </div>
  `
}

// 顯示User資訊
function renderUserModalInfo(data) {
  const bIsFavorite = favoriteList.some((item) => item.id === data.id)
  const btnFavorite = bIsFavorite
    ? 'btn-action-favorite-fill'
    : 'btn-action-favorite'
  const iconHeart = bIsFavorite ? 'bi-heart-fill' : 'bi-heart'
  if (data.gender === 'male') {
    modalContent.classList.add('content-male')
    modalContent.classList.remove('content-female')
  } else {
    modalContent.classList.add('content-female')
    modalContent.classList.remove('content-male')
  }

  modalContent.innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title" id="user-modal-title">${data.name} ${data.surname}</h5>
      <button
        type="button"
        class="close"
        data-dismiss="modal"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body" id="user-modal-body">
      <div class="row">
        <div class="col-sm-5 my-auto">
          <img
            src=${data.avatar}
            alt="user-avatar"
            id="user-modal-avatar"
            class="rounded-circle w-100"
          />
        </div>
        <div class="col-sm-7 m-0 p-2">
          <ul>
            <li>
              <p>Gender : <span id="user-modal-gender">${data.gender}</span></p>
            </li>
            <li>
              <p>Age : <span id="user-modal-age">${data.age}</span></p>
            </li>
            <li>
              <p>Region : <span id="user-modal-region">${data.region}</span></p>
            </li>
            <li>
              <p>
                Birthday :
                <span id="user-modal-birthday">${data.birthday}</span>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-footer justify-content-center">
      <div class="card-action">
        <a
          class="mailto-link"
          id="user-action-mailto-link"
          href="mailto:${data.email}"
        >
          <i
            class="btn-action btn-action-mailto bi bi-envelope m-3"
            id="user-modal-action-mailto"
          ></i>
        </a>
        <i
          class="btn-action ${btnFavorite} bi ${iconHeart} m-3"
          id="user-modal-action-favorite"
          data-id=${data.id}
        ></i>
      </div>
    </div>
  `
}

// 收藏點擊
function btnFavoriteClicked(id) {
  // 是否有搜尋資料
  const bIsSearch = filteredUsers.length ? true : false
  const list = bIsSearch ? filteredUsers : favoriteList
  if (!list) {
    // 目前清單是空的
    return
  }
  //透過 id 找到對象是否存在於目前清單中
  const userIndex = list.findIndex((user) => user.id === id)
  if (userIndex === -1) {
    // 在清單中不存在
    return
  }
  //取消收藏，刪除該筆對象
  list.splice(userIndex, 1)
  // 如果目前是搜尋清單，必須同時更新favoriteList
  if (bIsSearch) {
    //透過 id 找到對象是否存在於收藏清單中
    const userFavoriteIndex = favoriteList.findIndex((user) => user.id === id)
    //取消收藏，刪除該筆對象
    favoriteList.splice(userFavoriteIndex, 1)
  }
  localStorage.setItem('favoriteUser', JSON.stringify(favoriteList))

  //檢查目前頁數
  const numberOfPages = Math.ceil(list.length / USER_PER_PAGE)
  currentPage = currentPage > numberOfPages ? numberOfPages : currentPage
  //更新頁面
  renderPaginator(list.length)
  renderSocialList(getUsersByPage(currentPage))
  if (list.length === 0) {
    bIsSearch ? alert(`搜尋清單目前為空`) : alert(`收藏清單目前為空`)
  }
}

function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  let bIsAll = searchInput.value.trim().length === 0
  if (!bIsAll) {
    filteredUsers = favoriteList.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.surname.toLowerCase().includes(keyword)
    )
    //錯誤處理：無符合條件的結果
    if (filteredUsers.length === 0) {
      searchInput.value = ''
      return alert(`您輸入的關鍵字：${keyword} 沒有符合的對象`)
    }
    renderPaginator(filteredUsers.length)
  } else {
    // 顯示全部收藏
    filteredUsers = []
    renderPaginator(favoriteList.length)
  }
  currentPage = 1
  renderSocialList(getUsersByPage(currentPage))
}

function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page)
  //更新畫面
  renderSocialList(getUsersByPage(currentPage))
}

function onUserModalClicked(event) {
  if (
    event.target.matches('.btn-action-favorite') ||
    event.target.matches('.btn-action-favorite-fill')
  ) {
    btnFavoriteClicked(Number(event.target.dataset.id))
    // 關閉modal
    $('#user-modal').modal('hide')
    renderSocialList(getUsersByPage(currentPage))
  }
}

// 監聽
dataPanel.addEventListener('click', onPanelClicked)
searchForm.addEventListener('submit', onSearchFormSubmitted)
paginator.addEventListener('click', onPaginatorClicked)
userModal.addEventListener('click', onUserModalClicked)

// 顯示收藏列表資料
renderPaginator(favoriteList.length)
renderSocialList(getUsersByPage(currentPage))
if (favoriteList.length === 0) {
  alert(`收藏清單目前為空`)
}
