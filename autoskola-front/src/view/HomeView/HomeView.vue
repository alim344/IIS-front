<template>
  <div>
    <header class="top"> 
      <div class ="logo"> 
        <span class = "big_logo">TaSaMi</span>
        <span class = "small_logo">Car school</span>
      </div>
      <div class = "authbuttons"> 
          
          <button class = "log button">Login</button>
      </div>
  </header>

  <section class="about">
       <h1>Start Your Driving Journey Today</h1>
        <p>Choose the category that suits you best and start your journey with our certified instructors by your side.</p>
        <button class="reg button" @click="navigateToRegistration">Register</button>
  </section>

  <hr class="divider">

  <section class="categories"> 
      <div class="categories-grid">
        <div class="category_card" v-for="category in categories" :key="category.id"> 
          <div class="card-header">
            <h2 class="category-title">{{ category.title }}</h2>
          </div>
          
          <div>
            <p class="category-description">{{ category.description }}</p>
            
            <div class="category-details">
              <div class="detail-item">
                <span class="detail-label">Vehicles:</span>
                <span class="detail-value">{{ category.vehicles }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ category.duration }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Price:</span>
                <span class="detail-value">{{ category.price }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>



  </div>
  

</template>

<script>
  export default{
    data(){
       return{
         categories: [
            {
              id: 1,
              title: "Category AM",
              description: "Light motor vehicles intended for city and short-distance driving.",
              vehicles: "Mopeds and light quadricycles up to 45 km/h",
              duration: "20 hours",
              price: "€350"
            },
            {
              id: 2,
              title: "Category A1",
              description: "Entry-level motorcycle category suitable for beginners.",
              vehicles: "Motorcycles up to 125cc and 11 kW, motor tricycles up to 15 kW",
              duration: "25 hours",
              price: "€450"
            },
            {
              id: 3,
              title: "Category A2",
              description: "Mid-range motorcycle category with increased engine power.",
              vehicles: "Motorcycles up to 35 kW with power/weight ratio ≤ 0.2 kW/kg",
              duration: "30 hours",
              price: "€550"
            },
            {
              id: 4,
              title: "Category A",
              description: "Unlimited motorcycle category for experienced riders.",
              vehicles: "All motorcycles and motor tricycles",
              duration: "30 hours",
              price: "€650"
            },
            {
              id: 5,
              title: "Category B",
              description: "The most common driving license category for personal vehicles.",
              vehicles: "Passenger cars up to 3.5t, up to 8 passengers plus driver",
              duration: "40 hours",
              price: "€750"
            },
            {
              id: 6,
              title: "Category BE",
              description: "Extended category for cars with heavier trailers.",
              vehicles: "Category B vehicles with trailers exceeding 750 kg",
              duration: "10 hours",
              price: "€300"
            },
            {
              id: 7,
              title: "Category C",
              description: "Heavy goods vehicles used for professional transport.",
              vehicles: "Trucks over 3.5t without passenger transport",
              duration: "50 hours",
              price: "€1200"
            },
            {
              id: 8,
              title: "Category CE",
              description: "Heavy trucks with trailers or semi-trailers.",
              vehicles: "Category C vehicles with trailers or semi-trailers",
              duration: "15 hours",
              price: "€450"
            },
            {
              id: 9,
              title: "Category D",
              description: "Passenger transport vehicles for public or private transport.",
              vehicles: "Buses with more than 8 passenger seats",
              duration: "55 hours",
              price: "€1400"
            },
            {
              id: 10,
              title: "Category DE",
              description: "Bus category with trailer authorization.",
              vehicles: "Category D vehicles with trailers exceeding 750 kg",
              duration: "15 hours",
              price: "€500"
            }
          ]
       }

    },
    methods:{

      navigateToRegistration(){
        this.$router.push('/register');
      }
    }




  }
</script>

<style scoped>

body,html{
  margin: 0;
  padding: 0;
  height: 100vh;
  background-color: antiquewhite;
}

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

.log:hover{
   color: #484264;
  background-color: #342b56;
  color:#fef9fb;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(199, 147, 221, 0.8); /* Blue glow */
}


.about{
   margin: 150px 0 0 0;
}

.divider {
  width: 15%;         
  border: none;
  border-top: 10px solid #4f364b;
  border-radius: 5px;
  margin: 50px auto;
  
}


.categories {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  padding: 20px 0;
}


.category_card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.category_card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 15px 40px rgba(106, 13, 173, 0.2),
    0 0 25px rgba(190, 143, 233, 0.3);
  border-color: #be8fe9;
  background: linear-gradient(145deg, #fef9fb, #f5f0f9);
}

/* Card Header */
.card-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e9e1f5;
  padding-bottom: 15px;
}



.category-title {
  font-size: 1.8rem;
  color: #4f364b;
  margin: 10px 0 5px 0;
}


.category-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
  flex-grow: 1;
}

.category-details {
  background: rgba(190, 143, 233, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(106, 13, 173, 0.2);
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #4f364b;
  min-width: 100px;
}

.detail-value {
  color: #666;
  text-align: right;
  flex: 1;
  margin-left: 15px;
}


</style>
