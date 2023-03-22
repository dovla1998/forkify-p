import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//API
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //1. Update results view(mark selected)
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //2. Loading recipe
    await model.loadRecipe(id);

    //3. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const searchResults = async function () {
  try {
    resultsView.renderSpinner();

    //Get query
    const query = searchView.getQuery();
    if (!query) return;

    //Load search
    await model.loadSearchResults(query);

    //Render results
    resultsView.render(model.getSearchResultsPage());

    //Render pages buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const pagination = function (goToPage) {
  //NEW PAGE
  resultsView.render(model.getSearchResultsPage(goToPage));

  //NEW PAGE Render pages buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update recipe servings
  model.updateServings(newServings);

  //Update view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  //Update recipe view(bookmark icon)
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Spinner
    addRecipeView.renderSpinner();

    //Upload new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render new recipe
    recipeView.render(model.state.recipe);

    //Success
    addRecipeView.renderSuccessMessage();

    //Close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    //Render bookmark
    bookmarksView.render(model.state.bookmarks);

    //Change URL ID
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(searchResults);
  paginationView.addHandler(pagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
