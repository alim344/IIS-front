<template>
  <div class="component">
    <div class="card">

      <section class="topic">
        <h1>CREATE YOUR PROFILE</h1>
        <span>Begin your journey in safe hands</span>
      </section>

      <hr class="divider">

      <form class="registration-form">

        <div class="form-section">
          <h2>Personal info</h2>

          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                v-model="registerData.firstName"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                v-model="registerData.lastName"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Username</label>
              <input
                id="username"
                type="text"
                v-model="registerData.username"
                placeholder="Enter your username"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Email</label>
              <input
                id="email"
                type="email"
                v-model="registerData.email"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type= 'password' 
                id="password" 
                v-model="registerData.password"
                placeholder="Enter a strong password"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                v-model="registerData.confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div class="form-section">
            <h2>Course Selection</h2>
            <p class="section-description">Choose the driving category you want to register for</p>
            
            <div class="category-selection">
              <div 
                v-for="category in categories" 
                :key="category.id" 
                class="category-option"
                :class="{ 'selected': selectedCategory === category.id }"
                @click="selectCategory(category.id)"
              >
                <div class="category-info">
                  <h3>{{ category.title }}</h3>
                  <p class="category-price">{{ category.price }}</p>
                </div>
                <div class="category-duration">
                  <text>{{category.vehicles}}</text>
                </div>
              </div>
            </div>
          </div>


           <button class="reg button" @click.prevent="registerUser">Register</button>
          


        </div>

      </form>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  
  data() {
    return {
      selectedCategory:null,
      registerData: {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        category: ""
      },
      categories: [
        {
          id: "AM",
          title: "Category AM",
          vehicles: "Mopeds and light quadricycles up to 45 km/h",
          price: "€350"
        },
        {
          id: "A1",
          title: "Category A1",
          vehicles: "Motorcycles up to 125cc and 11 kW, motor tricycles up to 15 kW",
          price: "€450"
        },
        {
          id: "A2",
          title: "Category A2",
          vehicles: "Motorcycles up to 35 kW with power/weight ratio ≤ 0.2 kW/kg",
          price: "€550"
        },
        {
          id: "A",
          title: "Category A",
          vehicles: "All motorcycles and motor tricycles",
          price: "€650"
        },
        {
          id: "B",
          title: "Category B",
          vehicles: "Passenger cars up to 3.5t, up to 8 passengers plus driver",
          price: "€750"
        },
        {
          id: "BE",
          title: "Category BE",
          vehicles: "Category B vehicles with trailers exceeding 750 kg",
          price: "€300"
        },
        {
          id: 'C',
          title: "Category C",
          vehicles: "Trucks over 3.5t without passenger transport",
          price: "€1200"
        },
        {
          id: "CE",
          title: "Category CE",
          vehicles: "Category C vehicles with trailers or semi-trailers",
          price: "€450"
        },
        {
          id: "D",
          title: "Category D",
          vehicles: "Buses with more than 8 passenger seats",
          price: "€1400"
        },
        {
          id: "DE",
          title: "Category DE",
          vehicles: "Category D vehicles with trailers exceeding 750 kg",
          price: "€500"
        }
      ]
    };
  },
  methods:{

    selectCategory(categoryId){
      if(this.selectedCategory == categoryId){
        this.selectedCategory = null;
         this.registerData.category = null;
      }else{
        this.selectedCategory = categoryId;
         this.registerData.category = categoryId;
      }
    },
    registerUser(){

      if(this.selectedCategory == null){
        alert("Please choose a category u want to sign up for");
        return;
      }


      if(this.registerData.password != this.registerData.confirmPassword){
        alert("Passwords do not match.");
        return;
      }

      axios.post('http://localhost:8080/auth/register', this.registerData)
          .then(() => {
            alert('You have successfully registered.');
            this.$router.push('/');
          })
          .catch(error => {
            // Handle error response and display error message
            if(error.response.status == 409){
               this.registrationStatus = 'Username is already taken, please try again';
               alert('Username already exists. Please try again');
            }
            if (error.response && error.response.data) {
              this.registrationStatus = error.response.data.message || 'An error occurred during registration.';
            } else {
              this.registrationStatus = 'An error occurred during registration.';
            }
            console.error('Registration error:', error);
            
          });


    }


  }
};
</script>

<style scoped>
body,html{ 
  margin: 0;
  padding: 0; 
  height: 100vh;
  background: linear-gradient(135deg, #c9bad4 0%, #e9e1f5 100%);
   }
 .component{ 
  background-color: rgb(154, 154, 174);
   margin: 10px 50px; 
   min-height: 100vh; 
   padding: 50px; }


.card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}


.topic {
  text-align: center;
  margin-bottom: 30px;
}

.topic h1 {
  margin-bottom: 10px;
}

.divider {
  width: 15%;
  border: none;
  border-top: 8px solid #4f364b;
  border-radius: 5px;
  margin: 20px auto;
}


.registration-form {
  padding: 20px 0;
}

.info {
  margin-top: 30px;
  border-bottom-color: #4f364b;
}


.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 20px;
}


.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #4f364b;
}

.form-group input {
  padding: 12px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #be8fe9;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.2);
}

.form-section {
  margin-top: 20px ;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 2px solid #e9e1f5;
}


.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 30px;
}

.form-section h2 {
  color: #4f364b;
  font-size: 1.8rem;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid #be8fe9;
  display: inline-block;
}

.category-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}


.category-option {
  background: #f9f5ff;
  border: 2px solid #e9e1f5;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-option:hover {
  transform: translateY(-5px);
  border-color: #be8fe9;
  box-shadow: 0 5px 20px rgba(190, 143, 233, 0.2);
}

.category-option.selected {
  background: linear-gradient(135deg, #f5f0ff 0%, #e6d9f7 100%);
  border-color: #8a4baf;
  box-shadow: 0 8px 25px rgba(138, 75, 175, 0.2);
}

.category-info h3 {
  color: #4f364b;
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.category-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #8a4baf;
  margin: 10px 0;
}

.category-duration {
  color: #666;
  font-size: 0.9rem;
}


.button{
  border: 2px;
  padding: 8px 15px;
  margin: 0 10px;
  border-radius: 10px;
  cursor: pointer;
}



.reg{
  border-color:rgb(58, 40, 60);
  box-shadow: 0 4px 6px rgba(39, 27, 27, 0.9);
  font-size: 30px;
  background-color: rgb(190, 143, 233);
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: 20px 0 0 0;
}

.reg:hover{
  color: #484264;
  background-color: #342b56;
  color:#fef9fb;
  transform: scale(1.3);
  box-shadow: 0 0 20px rgba(199, 147, 221, 0.8); /* Blue glow */
}

</style>
