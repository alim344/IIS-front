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
                
              >
                <div class="category-info">
                  <h3>{{ category.title }}</h3>
                  <p class="category-price">{{ category.price }}</p>
                </div>
                <div class="category-duration">
                  <span>Ovde ce biti koja vozila pripadaju kat</span>
                </div>
              </div>
            </div>
          </div>


          
          


        </div>

      </form>

    </div>
  </div>
</template>

<script>
export default {
  
  data() {
    return {
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
          id: 1,
          title: "Category AM",
          description: "Light motor vehicles intended for city and short-distance driving.",
          duration: "20 hours",
          price: "€350"
        },
        {
          id: 2,
          title: "Category A1",
          duration: "25 hours",
          price: "€450"
        },
        {
          id: 3,
          title: "Category A2",
          duration: "30 hours",
          price: "€550"
        },
        {
          id: 4,
          title: "Category A",
          duration: "30 hours",
          price: "€650"
        },
        {
          id: 5,
          title: "Category B",
          duration: "40 hours",
          price: "€750"
        },
        {
          id: 6,
          title: "Category BE",
          duration: "10 hours",
          price: "€300"
        },
        {
          id: 7,
          title: "Category C",
          duration: "50 hours",
          price: "€1200"
        },
        {
          id: 8,
          title: "Category CE",
          duration: "15 hours",
          price: "€450"
        },
        {
          id: 9,
          title: "Category D",
          duration: "55 hours",
          price: "€1400"
        },
        {
          id: 10,
          title: "Category DE",
          duration: "15 hours",
          price: "€500"
        }
      ]
    };
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

</style>
