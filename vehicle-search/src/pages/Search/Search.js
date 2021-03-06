import React, { Component } from "react";
import { Container, Row } from "reactstrap";
import { Input, Item } from "../../components";
import { db, description, makeData } from "../../database";
import "./Search.css";

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      make: null,
      model: null,
      year: null,
      type: null,
      makeData,
      modelData: [],
      yearData: [],
      typeData: [],
      carData: null
    };
  }

  _breakType = type => {
    const data = type.split(" L - ");
    return { displ: data[0], trany: data[1] };
  };

  _searchByData = () => {
    const { make, model, year, type } = this.state;

    let searchQuery = {};
    let listType = "model";

    if (!model) {
      searchQuery = { make };
      listType = "make";
    } else if (!year) {
      searchQuery = { make, model };
      listType = "year";
    } else if (!type) {
      searchQuery = { make, model, year };
      listType = "type";
    } else {
      searchQuery = { make, model, year, ...this._breakType(type) };
      listType = "car";
    }

    db.find({
      selector: searchQuery
    })
      .then(result => {
        this._generateDataLists(result, listType);
      })
      .catch(err => {
        console.log(err);
      });
  };

  _generateDataLists = (data, listType) => {
    let { modelData, yearData, typeData, carData } = this.state;
    if (listType === "make") {
      modelData = [...new Set(data.docs.map(vehicle => vehicle.model))].sort();
    } else if (listType === "year") {
      yearData = [...new Set(data.docs.map(vehicle => vehicle.year))].sort();
    } else if (listType === "type") {
      typeData = [
        ...new Set(
          data.docs.map(vehicle => `${vehicle.displ} L - ${vehicle.trany}`)
        )
      ];
    } else if (listType === "car") {
      carData = data.docs[0];
    }

    this.setState({ modelData, yearData, typeData, carData });
  };

  _handleInputChange = selectedOption => {
    const { name, value } = selectedOption;
    if (name === "make") {
      this.setState(
        { [name]: value, model: null, year: null, type: null, carData: null },
        this._searchByData
      );
    }

    if (name === "model") {
      this.setState(
        { [name]: value, year: null, type: null, carData: null },
        this._searchByData
      );
    }

    if (name === "year") {
      this.setState(
        {
          [name]: value,
          type: null,
          carData: null
        },
        this._searchByData
      );
    }

    if (name === "type") {
      this.setState(
        {
          [name]: value
        },
        this._searchByData
      );
    }
  };

  render = () => {
    const {
      make,
      model,
      year,
      type,
      makeData,
      modelData,
      yearData,
      typeData,
      carData
    } = this.state;
    return (
      <Container
        fluid
        className="d-flex flex-fill flex-column align-items-center justify-content-center"
      >
        <Row className="w-100 justify-content-center">
          <div className="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12 my-1">
            <Input
              data={makeData}
              title="Select a make"
              selected={make}
              onChange={this._handleInputChange}
              name="make"
            />
          </div>

          {make && modelData ? (
            <div className="col-lg col-xl col-md-12 col-sm-12 col-xs-12 my-1">
              <Input
                data={modelData}
                title="Select a model"
                selected={model}
                onChange={this._handleInputChange}
                name="model"
              />
            </div>
          ) : null}
        </Row>
        <Row className="w-100 justify-content-center">
          {model && make && yearData ? (
            <div className="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12 my-1">
              <Input
                data={yearData}
                title="Select a year"
                selected={year}
                onChange={this._handleInputChange}
                name="year"
              />
            </div>
          ) : null}
          {model && make && year && typeData ? (
            <div className="col-lg col-xl col-md-12 col-sm-12 col-xs-12 my-1">
              <Input
                data={typeData}
                title="Select a type"
                selected={type}
                onChange={this._handleInputChange}
                name="type"
              />
            </div>
          ) : null}
        </Row>
        <Row className="justify-content-center my-2">
          {carData
            ? Object.keys(carData).map((key, index) => {
                return description[key] ? (
                  <Item
                    id={key}
                    key={index}
                    value={carData[key]}
                    description={description[key].description}
                    properName={description[key].properName}
                  />
                ) : null;
              })
            : null}
        </Row>
      </Container>
    );
  };
}

export default Search;
