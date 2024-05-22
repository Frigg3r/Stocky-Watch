import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { AuthService } from './services/auth.service';
import { useNavigate } from 'react-router-dom';

const validateMessages = {
    required: 'Обязательное поле!',
    string: { min: 'Минимум 8 символов!' }
};

const authService = new AuthService();

function LoginForm(props) {
    const [isLogin, setIsLogin] = useState(true);
    const [authErrorMessage, setAuthErrorMessage] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    async function auth() {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            console.log('Auth values:', values); // Логируем значения формы
            const res = isLogin ? await authService.login(values) : await authService.register(values);
            console.log('Auth response:', res); // Логируем ответ сервера
            if (res.success) {
                props.setCurrentUserInfo(res.userInfo);
                props.setIsLoggedIn(true);
            } else {
                setAuthErrorMessage(isLogin ? 'Не верные логин или пароль!' : 'Такой логин уже есть!');
            }
        } catch (err) {
            console.log('Ошибка валидации или запроса:', err);
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
        <>
            <div className='login-page'>
                <div className='login-form-wrapper'>
                    <h1>{isLogin ? 'Авторизация' : 'Регистрация'}</h1>
                    <Form
                        labelAlign='left'
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 18 }}
                        form={form}
                        validateMessages={validateMessages}
                    >
                        <Form.Item
                            label='Логин'
                            name='login'
                            rules={[{ required: true }]}
                        >
                            <Input allowClear />
                        </Form.Item>
                        <Form.Item
                            label='Пароль'
                            name='password'
                            rules={[{ required: true, min: 8 }]}
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
                            >
                                <Input.Password allowClear />
                            </Form.Item>
                        )}
                    </Form>
                    {authErrorMessage && <div className='auth-error-message'>{authErrorMessage}</div>}
                    <Button type='primary' style={{ width: 200 }} onClick={(e) => {
                        e.preventDefault();
                        auth().then(() => {
                            console.log('Auth successful, navigating to home page...');
                            navigate('/'); // Перенаправляем на главную страницу
                            document.location.reload(); // Перезагрузка страницы после выполнения аутентификации или регистрации
                        }).catch((err) => {
                            console.log('Ошибка при выполнении запроса:', err);
                            setAuthErrorMessage('Ошибка при выполнении запроса');
                        });
                    }}>
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                    <p>
                        {isLogin ? 'Еще не зарегистрированы?🤨' : 'Если есть аккаунт, можете в него войти🤓👉'}
                        <Button type='link' onClick={changeAuthType}>
                            {isLogin ? 'Зарегистрироваться' : 'Авторизоваться'}
                        </Button>
                    </p>
                </div>
            </div>
        </>
    );
}

export default LoginForm;
