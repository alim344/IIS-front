<template>
    <div>
        <header class="top"> 
            <div class ="logo"> 
                <span class = "big_logo">TaSaMi</span>
                <span class = "small_logo">Car school</span>
            </div>
            <div class = "authbuttons"> 
                
                <button class = "log button" @click="navigateToHomePage">Log out</button>
            </div>
        </header>
        <div class="brisiteovo">
            <h1>PROFESSOR</h1>
        </div>
    </div>
</template>

<script>

export default {
    methods:{
        navigateToHomePage(){
            localStorage.removeItem('token');
            localStorage.removeItem('role');

            this.$router.push('/');
        }
    }
}
</script>

<style scoped>
.top{
  display: flex;
  justify-content: space-between;
  align-content: center;
  width: 100%;
  height: 80px;
  background-color: rgb(154, 154, 174);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

.logo{
  margin:20px;

}

.big_logo{
  font-size: 40px;
  font-weight: 700;
  color: white;
}

.small_logo{
  font-size: 19px;
  opacity: 0.8;
  margin-left: 5px;
}

.authbuttons{
  margin:10px;
  align-content: center;
  padding: 10px;
  justify-content: space-between;
}

.button{
  border: 2px;
  padding: 8px 15px;
  margin: 0 10px;
  border-radius: 10px;
  cursor: pointer;
}

.log{
  border-color:rgb(58, 40, 60);
  box-shadow: 0 4px 6px rgba(39, 27, 27, 0.9);
  font-size: 20px;
  background-color: rgb(190, 143, 233);
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}


.log:hover{
   color: #484264;
  background-color: #342b56;
  color:#fef9fb;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(199, 147, 221, 0.8); /* Blue glow */
}

.brisiteovo{
    margin-top: 150px;
}
</style>
