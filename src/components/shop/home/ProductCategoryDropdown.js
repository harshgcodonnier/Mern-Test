import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct, productByPrice } from "../../admin/products/FetchApi";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const CategoryList = () => {
  const history = useHistory();
  const { data } = useContext(HomeContext);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories && categories.length > 0 ? (
          categories.map((item, index) => {
            return (
              <Fragment key={index}>
                <div
                  onClick={(e) =>
                    history.push(`/products/category/${item._id}`)
                  }
                  className="col-span-1 m-2 flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <img
                    src={`${apiURL}/uploads/categories/${item.cImage}`}
                    alt="pic"
                  />
                  <div className="font-medium">{item.cName}</div>
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="text-xl text-center my-4">No Category</div>
        )}
      </div>
    </div>
  );
};

const FilterList = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [range, setRange] = useState(0);

  const rangeHandle = (e) => {
    setRange(e.target.value);
    fetchData(e.target.value);
  };

  const fetchData = async (price) => {
    if (price === "all") {
      try {
        let responseData = await getAllProduct();
        if (responseData && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch({ type: "loading", payload: true });
      try {
        setTimeout(async () => {
          let responseData = await productByPrice(price);
          if (responseData && responseData.Products) {
            console.log(responseData.Products);
            dispatch({ type: "setProducts", payload: responseData.Products });
            dispatch({ type: "loading", payload: false });
          }
        }, 700);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const closeFilterBar = () => {
    fetchData("all");
    dispatch({ type: "filterListDropdown", payload: !data.filterListDropdown });
    setRange(0);
  };

  return (
    <div className={`${data.filterListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-col">
        <div className="font-medium py-2">Filter by price</div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
            <label htmlFor="points" className="text-sm">
              Price (between 0 and 10$):{" "}
              <span className="font-semibold text-yellow-700">{range}.00$</span>{" "}
            </label>
            <input
              value={range}
              className="slider"
              type="range"
              id="points"
              min="0"
              max="1000"
              step="10"
              onChange={(e) => rangeHandle(e)}
            />
          </div>
          <div onClick={(e) => closeFilterBar()} className="cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterAndSearch = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [range, setRange] = useState(0);
  const [titleSearch, setTitleSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [productArray, setPa] = useState(null);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    try {
      let responseData = await getAllProduct();
      if (responseData && responseData.Products) {
        setPa(responseData.Products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rangeHandle = (e) => {
    setRange(e.target.value);
    filterData(e.target.value, titleSearch, categorySearch);
  };

  const titleSearchHandle = (e) => {
    setTitleSearch(e.target.value);
    filterData(range, e.target.value, categorySearch);
  };

  const categorySearchHandle = (e) => {
    setCategorySearch(e.target.value);
    filterData(range, titleSearch, e.target.value);
  };

  const filterData = async (price, title, category) => {
    dispatch({ type: "loading", payload: true });
    
    try {
      setTimeout(async () => {
        let filteredProducts = productArray;

        // Filter by price
        if (price > 0) {
          filteredProducts = filteredProducts.filter(product => 
            product.pPrice <= price
          );
        }

        // Filter by title
        if (title) {
          filteredProducts = filteredProducts.filter(product =>
            product.pName.toUpperCase().indexOf(title.toUpperCase()) !== -1
          );
        }

        // Filter by category
        if (category && categories) {
          const matchingCategory = categories.find(cat =>
            cat.cName.toUpperCase().indexOf(category.toUpperCase()) !== -1
          );
          if (matchingCategory) {
            filteredProducts = filteredProducts.filter(product =>
              product.pCategory === matchingCategory._id
            );
          }
        }

        dispatch({ type: "setProducts", payload: filteredProducts });
        dispatch({ type: "loading", payload: false });
      }, 300);
    } catch (error) {
      console.log(error);
      dispatch({ type: "loading", payload: false });
    }
  };

  const closeFilterSearchBar = () => {
    dispatch({ type: "filterSearchDropdown", payload: !data.filterSearchDropdown });
    dispatch({ type: "setProducts", payload: productArray });
    setRange(0);
    setTitleSearch("");
    setCategorySearch("");
  };

  return (
    <div className={`${data.filterSearchDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="font-medium text-lg">Filter & Search Products</div>
          <div onClick={closeFilterSearchBar} className="cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="priceRange" className="text-sm font-medium">
            Filter by Price (between 0 and 1000$):{" "}
            <span className="font-semibold text-yellow-700">{range}.00$</span>
          </label>
          <input
            id="priceRange"
            value={range}
            className="slider w-full"
            type="range"
            min="0"
            max="1000"
            step="10"
            onChange={rangeHandle}
          />
        </div>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title Search */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="titleSearch" className="text-sm font-medium">
              Search by Product Title:
            </label>
            <input
              id="titleSearch"
              value={titleSearch}
              onChange={titleSearchHandle}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              type="text"
              placeholder="Enter product title..."
            />
          </div>

          {/* Category Search */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="categorySearch" className="text-sm font-medium">
              Search by Category:
            </label>
            <input
              id="categorySearch"
              value={categorySearch}
              onChange={categorySearchHandle}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              type="text"
              placeholder="Enter category name..."
            />
          </div>
        </div>

        {/* Clear All Button */}
        {(range > 0 || titleSearch || categorySearch) && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setRange(0);
                setTitleSearch("");
                setCategorySearch("");
                dispatch({ type: "setProducts", payload: productArray });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterAndSearch />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
