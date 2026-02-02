<template>
  <div class="login-container">
    <header class="top"> 
      <div class="logo"> 
        <span class="big_logo">TaSaMi</span>
        <span class="small_logo">Car school</span>
      </div>
     
    </header>

    <div class="login-content">
      <div class="login-card">
        <section class="topic">
          <h1>WELCOME BACK</h1>
          <span>Sign in to continue your journey</span>
        </section>

        <hr class="divider">

        <form class="login-form" @submit.prevent="loginUser">
          <div class="form-section">
            <div class="form-group">
              <label for="username">Email</label>
              <input
                id="email"
                type="text"
                v-model="loginData.email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                v-model="loginData.password"
                placeholder="Enter your password"
                required
              />
            </div>

            
            <button type="submit" class="login-btn button">
              Sign In
            </button>

            <div class="register-link">
              <p>Don't have an account? 
                <a href="#" @click="navigateToRegistration">Register here</a>
              </p>
            </div>

           
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginView',
  data() {
    return {
      loginData: {
        email: '',
        password: ''
      },
    };
  },
  mounted() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
},
  methods: {
    
    
    navigateToRegistration() {
      this.$router.push('/register');
    },
    
    loginUser() {

      

      axios.post('http://localhost:8080/auth/signin', this.loginData)
        .then(response => {


          const auth = response.data;
          
          localStorage.setItem('token', auth.token);
          localStorage.setItem('role', auth.role);
            
          if(auth.role == "ROLE_CANDIDATE"){
                this.$router.push('/candidateHome');
          }else if(auth.role == "ROLE_INSTRUCTOR"){
                this.$router.push('/instructorHome');
          }else if(auth.role == "ROLE_ADMIN"){
            this.$router.push('/adminHome');
          }else if(auth.role == "ROLE_PROFESSOR"){
                this.$router.push('/professorHome');
          }else{
            alert('Mistake with the role');
            return;
          }
        })
        .catch(error => {
          console.error('Error:', error);
            alert("Login failed");
        });
    },
  },
  
};
</script>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
  height: 100vh;
  background: linear-gradient(135deg, #c9bad4 0%, #e9e1f5 100%);
  font-family: 'Arial', sans-serif;
}

.login-container {
  
  background: linear-gradient(135deg, #c9bad4 0%, #e9e1f5 100%);
}

/* Header Styles */
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80px;
  background-color: rgb(154, 154, 174);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

.logo {
  margin: 20px;
}

.big_logo {
  font-size: 40px;
  font-weight: 700;
  color: white;
}

.small_logo {
  font-size: 19px;
  opacity: 0.8;
  margin-left: 5px;
  color: white;
}


/* Main Content */
.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 120px 20px 40px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}


.topic {
  text-align: center;
  margin-bottom: 30px;
}

.topic h1 {
  color: #4f364b;
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.topic span {
  color: #666;
  font-size: 1.1rem;
}

.divider {
  width: 15%;
  border: none;
  border-top: 8px solid #4f364b;
  border-radius: 5px;
  margin: 20px auto;
}


.login-form {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4f364b;
  font-size: 1rem;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #be8fe9;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.2);
}



.button {
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  display: inline-block;
}

.login-btn {
  background-color: rgb(190, 143, 233);
  color: white;
  font-size: 1.1rem;
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid transparent;
  box-shadow: 0 4px 6px rgba(39, 27, 27, 0.2);
}

.login-btn:hover {
  background-color: #342b56;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(190, 143, 233, 0.3);
}

.reg {
  border-color: rgb(58, 40, 60);
  box-shadow: 0 4px 6px rgba(39, 27, 27, 0.2);
  font-size: 18px;
  background-color: rgb(190, 143, 233);
  color: white;
  transition: all 0.3s ease;
}

.reg:hover {
  background-color: #342b56;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(199, 147, 221, 0.8);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #be8fe9;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
  color: #8a4baf;
}



</style>