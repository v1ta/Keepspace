import React, {Component} from 'react';
import logo from '!!file!../assets/keepspaceLogoWhiteText.png';
import {login, header} from '../styles/splash.scss';

export default class Splash extends Component {
    render() {
        return(
            <div>
                <div className={header}>
                    <img src={logo}/>
                </div>
                <LoginForm/>
            </div>
        );
    }
}

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {signup: false};
        this.handleClick = this.handleClick.bind(this);
        this.renderForm = this.renderForm.bind(this);
    }

    handleClick() {
        this.setState({signup: !this.state.signup});
    }

    renderForm() {
        return this.state.signup ? (
            <form>
                <input type="text" name="firstname" placeholder="first name"/>
                <br/>
                <input type="text" name="lastname" placeholder="last name"/>
                <br/>
                <input type="text" name="email" placeholder="email"/>
                <br/>
                <input type="password" name="password" placeholder="password"/>
                <button>create</button>
                <p>Already registered? <a href="#" onClick={this.handleClick}>Sign In</a></p>
            </form>
        ) : (
            <form>
                <input type="text" name="email" placeholder="email"/>
                <br/>
                <input type="password" name="password" placeholder="password"/>
                <button>login</button>
                <p>Not registered? <a href="#" onClick={this.handleClick}>Create an account</a></p>
            </form>
        );
    }

    render() {
        return (
            <div className={login}>
                {this.renderForm()}
            </div>
        );
    }
}
