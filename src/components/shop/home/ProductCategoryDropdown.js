import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct, productByPrice, productBySearch } from "../../admin/products/FetchApi";
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

const FilterSearch = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [priceRange, setPriceRange] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
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

  const handleSearch = async () => {
    dispatch({ type: "loading", payload: true });

    try {
      let responseData = null;

      if (priceRange > 0) {
        responseData = await productByPrice(priceRange);
      }
      else if (searchTitle.trim() || searchCategory.trim()) {
        responseData = await productBySearch({
          title: searchTitle,
          description: searchCategory,
          maxPrice: ""
        });
      }
      else {
        responseData = await getAllProduct();
      }

      if (responseData) {
        if (responseData.success && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
        } else if (responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
        } else {
          dispatch({ type: "setProducts", payload: [] });
        }
      } else {
        dispatch({ type: "setProducts", payload: [] });
      }

      dispatch({ type: "loading", payload: false });
    } catch (error) {
      dispatch({ type: "loading", payload: false });
      dispatch({ type: "setProducts", payload: [] });
    }
  };

  const clearFilters = async () => {
    setSearchTitle("");
    setSearchCategory("");
    setPriceRange(0);

    try {
      let responseData = await getAllProduct();
      if (responseData && responseData.Products) {
        dispatch({ type: "setProducts", payload: responseData.Products });
      }
    } catch (error) {
      console.log(error);
    }

    dispatch({ type: "filterSearchDropdown", payload: false });
  };

  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
    if (e.target.value > 0) {
      setSearchTitle("");
      setSearchCategory("");
    }
  };

  const handleTitleChange = (e) => {
    setSearchTitle(e.target.value);
    if (e.target.value.trim()) {
      setPriceRange(0);
    }
  };

  const handleCategoryChange = (e) => {
    setSearchCategory(e.target.value);
    if (e.target.value.trim()) {
      setPriceRange(0);
    }
  };

  return (
    <div className={`${data.filterSearchDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="font-medium text-lg">Filter & Search Products</div>
          <div onClick={clearFilters} className="cursor-pointer">
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

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="searchTitle" className="text-sm font-medium text-gray-700">
              Search by Product Title
            </label>
            <input
              id="searchTitle"
              value={searchTitle}
              onChange={handleTitleChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              type="text"
              placeholder="Enter product name..."
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="searchCategory" className="text-sm font-medium text-gray-700">
              Search by Category/Description
            </label>
            <input
              id="searchCategory"
              value={searchCategory}
              onChange={handleCategoryChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              type="text"
              placeholder="Enter category or description..."
            />
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="priceRange" className="text-sm font-medium text-gray-700">
            Filter by Maximum Price:
            <span className="font-semibold text-yellow-700 ml-1">${priceRange}</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              id="priceRange"
              value={priceRange}
              className="slider flex-1"
              type="range"
              min="0"
              max="1000"
              step="10"
              onChange={handlePriceChange}
            />
            <span className="text-sm text-gray-500">$0 - $1000</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSearch}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterSearch />
    </Fragment>
  );
};

export default ProductCategoryDropdown;