const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageForminput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username,room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>{
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled? 얼마나 스크롤 내렷나 길이
  const scrollOffset = $messages.scrollTop + visibleHeight

  // 전체 높이랑 스크롤내린 길이가 같으면 (새매세지 높이를 안빼줘야함)
  if(containerHeight - newMessageHeight <= scrollOffset ){
    // 바닥으로 스크롤 가게 하는거
    $messages.scrollTop = $messages.scrollHeight
  }
}




socket.on('message',(message)=>{
  console.log(message)
  const html = Mustache.render(messageTemplate,{
    username:message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})


socket.on('locationMessage',(message)=>{
  console.log(message)
  const html = Mustache.render(locationMessageTemplate,{
    username: message.username,
    url:message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})


socket.on('roomData',({room,users}) =>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage',message,(error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageForminput.value = ''
    $messageForminput.focus()
  
    if(error){
      return console.log(error)
    }

    console.log('Message delivered')
  })
})

$sendLocationButton.addEventListener('click',()=>{
  if(!navigator.geolocation){
    return alert('Geolocation is not supportd by your browser.')
  }
  
  $sendLocationButton.setAttribute('disabled','disabled')
  
  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation',{
        latitude:position.coords.latitude, 
        longitude:position.coords.longitude
      },()=>{
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared')
     })
  })
})

socket.emit('join', {username,room}, (error)=>{
  if(error){
    alert(error)
    location.href='/'
  }
})