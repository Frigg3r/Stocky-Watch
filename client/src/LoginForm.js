import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { AuthService } from './services/auth.service';
import { useNavigate } from 'react-router-dom';
import './styles/LoginForm.css'; // Ensure you have a CSS file

const validateMessages = {
    required: 'Обязательное поле!',
    string: { min: 'Минимум 8 символов!' }
};

const authService = new AuthService();

function LoginForm({ setCurrentUserInfo, setIsLoggedIn }) {
    const [isLogin, setIsLogin] = useState(true);
    const [authErrorMessage, setAuthErrorMessage] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    async function auth() {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            const res = isLogin ? await authService.login(values) : await authService.register(values);
            if (res.success) {
                setCurrentUserInfo(res.userInfo);
                setIsLoggedIn(true);
                navigate('/'); // Перенаправляем на главную страницу
                document.location.reload(); // Перезагрузка страницы после выполнения аутентификации или регистрации
            } else {
                setAuthErrorMessage(isLogin ? 'Не верные логин или пароль!' : 'Такой логин уже есть!');
            }
        } catch (err) {
            setAuthErrorMessage('Ошибка валидации или запроса');
        }
    }

    function changeAuthType() {
        setAuthErrorMessage('');
        setIsLogin(!isLogin);
        form.resetFields();
    }

    async function repeatPasswordFieldValidation(formRecord) {
        const passwordField = formRecord.getFieldValue('password');
        const passwordRepeatField = formRecord.getFieldValue('passwordRepeat');
        if (passwordRepeatField && passwordField !== passwordRepeatField) {
            return Promise.reject('Пароли не совпадают!');
        }
        return Promise.resolve();
    }

    return (
        <div className='login-page'>
            <div className='login-form-wrapper'>
                <h1 className='auth-title'>{isLogin ? 'Авторизация' : 'Регистрация'}</h1>
                <Form
                    form={form}
                    validateMessages={validateMessages}
                    className="auth-form"
                >
                    <Form.Item
                        label='Логин'
                        name='login'
                        rules={[{ required: true }]}
                        className='form-item'
                    >
                        <Input allowClear />
                    </Form.Item>
                    <Form.Item
                        label='Пароль'
                        name='password'
                        rules={[{ required: true, min: 8 }]}
                        className='form-item'
                    >
                        <Input.Password allowClear />
                    </Form.Item>
                    {!isLogin && (
                        <Form.Item
                            label='Повтор пароля'
                            name='passwordRepeat'
                            rules={[
                                { required: true },
                                form => ({
                                    validator() {
                                        return repeatPasswordFieldValidation(form);
                                    }
                                })
                            ]}
                            className='form-item'
                        >
                            <Input.Password allowClear />
                        </Form.Item>
                    )}
                </Form>
                {authErrorMessage && <div className='auth-error-message'>{authErrorMessage}</div>}
                <Button type='primary' className='auth-button' onClick={(e) => {
                    e.preventDefault();
                    auth();
                }}>
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </Button>
                <p className="auth-switch">
                    {isLogin ? 'Еще не зарегистрированы?' : 'Если есть аккаунт, можете в него войти'}
                    <Button type='link' onClick={changeAuthType}>
                        {isLogin ? 'Зарегистрироваться' : 'Авторизоваться'}
                    </Button>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;