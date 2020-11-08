const mealsEl = document.getElementById('meals');
const mealsList = document.getElementById('meals-list');
const searchTerm = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const mobileContainer = document.getElementById('mobile-container');
getRandomMeal();
fetchFavMeal();
async function getRandomMeal(){
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    setRandomMeal(randomMeal,true);
}

async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+ id);
    const respData = await resp.json();
    return respData.meals[0];
}
async function getMealBySearch(term){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);
    const respData = await resp.json();
    return respData.meals;

}
function setRandomMeal(mealData,random = false){
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
                <div class="meal-header">${
                    random?`
                    <span>Random meal</span>`:``}
                    <img id='image' src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn"><i class="fas fa-heart"></i></button>
                </div>
    `;
   const btn = meal.querySelector(".meal-body .fav-btn");
   btn.addEventListener('click',()=>{
        if(btn.classList.contains('active')){
            btn.classList.remove('active');
            removeMealFromLs(mealData.idMeal);
        }
        else{
            btn.classList.add('active');
            addMealsToLs(mealData.idMeal);
        }
        mealsList.innerHTML = '';
        fetchFavMeal();
    })
    const image = meal.querySelector('#image');
    image.addEventListener('click',()=>{
        showMealDetails(mealData);
    })
    mealsEl.appendChild(meal);
}
function removeMealFromLs(meal){
    const mealsIds = getMealsfromLs();
    localStorage.setItem('mealsIds',JSON.stringify(mealsIds.filter(id => id!== meal)));
}

function addMealsToLs(mealId){
    const mealIds = getMealsfromLs();
    localStorage.setItem('mealsIds',JSON.stringify([...mealIds,mealId]));
}

function getMealsfromLs(){
    const mealsIds = JSON.parse(localStorage.getItem('mealsIds'));
    return mealsIds === null? [] : mealsIds;
}
async function fetchFavMeal(){
    mealsList.innerHTML = '';
      const mealIds = getMealsfromLs();
      const meals = [];
      for(let i =0;i<mealIds.length;++i){ 
         const mealId = mealIds[i];
         const meal = await getMealById(mealId);
         showFavMeals(meal);
      }  
}
function showFavMeals(mealData){

    const meal = document.createElement('li');
    meal.innerHTML = `
         <li>
            <img id='thumb' src="${mealData.strMealThumb}" alt="">
            <span>${mealData.strMeal}</span>
            <button id='clear' class='clear'><i class="fas fa-window-close"></i></button>
        </li>
    `;
    const close = meal.querySelector('#clear');
    close.addEventListener('click',()=>{
        removeMealFromLs(mealData.idMeal);
        fetchFavMeal();
    });
    const thumb = meal.querySelector('#thumb');
    thumb.addEventListener('click',()=>{
        showMealDetails(mealData);
    });
    mealsList.appendChild(meal);
}

searchBtn.addEventListener('click',async ()=>{
    const search = searchTerm.value;
    if(search != ''){
        mealsEl.innerHTML = '';
        const meals =  await getMealBySearch(search);
        if(meals){
            meals.forEach(meal => {
                setRandomMeal(meal);
                console.log(meal);
            });
        }
    }
})

function showMealDetails(mealData){
    mobileContainer.style.display = 'none';
    let ingArray = [];
    let i=1;
    for(let key in mealData){
        if (mealData[key] && key === 'strIngredient'+i){
            ingArray.push(mealData[key]);
            ++i;
        }
    }
    console.log(ingArray);
    const container = document.createElement('div');
    container.classList.add('detail-cont');
    container.innerHTML = `
        <button id = 'back'><i class="fas fa-times"></i></button>
            <div class="name-img">
                <h1>${mealData.strMeal}</h1>
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            </div>
            <div class="ing-cont">
                <ol class="ing-list" id='ing-list'>
                    <h3>INGREDIENTS:-</h3>
                    
                </ol>
            </div>
            <div class="discription-cont">
                <p>${mealData.strInstructions}</p>
            </div>
    `;
    const ingCont = container.querySelector('#ing-list')
    ingArray.forEach(ing =>{
        let newLi = document.createElement('li');
        newLi.innerText = ing;
        ingCont.appendChild(newLi);
    });
    const detailView = document.getElementById('detail-view');
    detailView.style.display = 'flex';

    removeAllChildNodes(detailView);
    detailView.appendChild(container);

    const backBtn = container.querySelector('#back');
    backBtn.addEventListener('click',()=>{
        mobileContainer.style.display = 'block';
        detailView.style.display= 'none';
    });
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
