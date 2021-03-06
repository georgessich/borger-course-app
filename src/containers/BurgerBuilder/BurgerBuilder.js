

import React, { Component } from 'react';

import Aux from '../../hoc/auxiliery';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
const INGRIDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.7,
    meat: 1.7,
    bacon: 1.2

}
class BurgerBuilder extends Component {
    
    state = {
        ingridients: null,
        totalPrice: 4,
        purchasble: false,
        purchasing: false,
        loading: false,
        error: false
        }
        
        componentDidMount () {
            axios.get('https://react-burger-911ad-default-rtdb.europe-west1.firebasedatabase.app/ingridients.json')
            .then(response => {
                this.setState({ingridients: response.data})
            })
            .catch (error => {
                this.setState({error: true})
            });
        }

    updatePurchaseState (ingridients) {
        
        const sum = Object.keys(ingridients)
        .map(igKey => {
            return ingridients[igKey];
        })
        .reduce((sum, el) => {
            return sum + el;
        }, 0);
        this.setState({purchasble: sum > 0})
    }

    addIngridientHandler = (type) => {
        const oldCount = this.state.ingridients[type];
        const updatedCount = oldCount + 1;
        const updatedIngridients = {
            ...this.state.ingridients
        };
        updatedIngridients[type] = updatedCount;
        const priceAddition = INGRIDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingridients: updatedIngridients})
        this.updatePurchaseState(updatedIngridients);
    }

    removeIngridientHandler = (type) => {
        const oldCount = this.state.ingridients[type];
        if(oldCount <= 0){
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngridients = {
            ...this.state.ingridients
        };
        updatedIngridients[type] = updatedCount;
        const priceDeduction = INGRIDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totalPrice: newPrice, ingridients: updatedIngridients});
        this.updatePurchaseState(updatedIngridients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }


    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        // alert('You Continue');
        
        const queryParams = [];
        for (let i in this.state.ingridients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingridients[i]));
        }
        queryParams.push('price=' + this.state.totalPrice);
        const queryString = queryParams.join('&');
        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        });
    }
    render () {
        const disableInfo = {
            ...this.state.ingridients
        };
        for(let key in disableInfo) {
            disableInfo[key] = disableInfo[key] <= 0
        }  
        let orderSummary = null;

       
        let burger = this.state.error ? <p>Ingridients can't beloaded</p> : <Spinner />
        if (this.state.ingridients){
        burger = (
            <Aux>
            <Burger  ingridients={this.state.ingridients} />
            <BuildControls 
            ingridientAdded = {this.addIngridientHandler}
            ingridientRemoved = {this.removeIngridientHandler}
            disabled={disableInfo} 
            purchasable = {this.state.purchasble}
            ordered={this.purchaseHandler}
            price={this.state.totalPrice}/>
            </Aux>);
            orderSummary = <OrderSummary ingridients={this.state.ingridients}
            price = {this.state.totalPrice}
            purchaseCancelled={this.purchaseCancelHandler}
            purchaseContinued={this.purchaseContinueHandler}/>;
            }
            if (this.state.loading) {
                orderSummary = <Spinner />
            }
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                    </ Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);