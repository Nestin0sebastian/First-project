var  emailError = document.getElementById('loginemail');
var passwordError = document.getElementById('loginpassword');
var submitError = document.getElementById('loginbutton');




function validateEmail() {
  var email = document.getElementById('singin-email').value.trim();

  if (email.length === 0) {
    emailError.innerHTML = 'Email should not be blank';
    return false;
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    emailError.innerHTML = 'Invalid email address';
    setTimeout(function(){
        submitError.style.display='none';
    
    },3000);
    return false;

  }
  emailError.innerHTML = '';
  return true;
}

function validatePassword() {
  var password = document.getElementById('singin-password').value.trim();

  if (password.length === 0) {
    passwordError.innerHTML = 'Password should not be blank';
    return false;
  }
  
  passwordError.innerHTML = '';
  return true;
}

function validateform(){
    if(!validateEmail ()||!validatePassword()){
        submitError.style.display='block',
        submitError.innerHTML='Please check your detailes';
        setTimeout(function(){
            submitError.style.display='none';
        
        },3000);
        return false;
    }
    return true
}
    