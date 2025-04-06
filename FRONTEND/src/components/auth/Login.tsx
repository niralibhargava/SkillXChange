import { useState, useContext } from 'react';
import { username_context } from '../../App';
import { useNavigate } from 'react-router-dom';
import Errorpop from '../Errorpop/Errorpop';

type Login = {
	emailOrUsername: string;
	password: string;
};

export default function Login() {
	const [login, setlogin] = useState<Login>({
		emailOrUsername: '',
		password: '',
	});

	const navigate = useNavigate();
	const [err, seterror] = useState(false);
	const [errormsg, setmsg] = useState('');

	const { setuser_id } = useContext(username_context);

	const handleLogin = async () => {
		const { emailOrUsername, password } = login;

		if (!emailOrUsername || !password) {
			setmsg("Please fill all fields");
			seterror(true);
			return;
		}

		try {
			const res = await fetch('http://127.0.0.1:8787/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(login),
			});

			const data = await res.json();
			console.log(data);

			if (data.isCorrectPassword) {
				setuser_id(data.username);
				localStorage.setItem('user_id', data.username);
				localStorage.setItem('emailOrUsername', emailOrUsername);
				navigate('/');
			} else {
				setmsg('Please enter correct username and password');
				seterror(true);
			}
		} catch (error: any) {
			setmsg(error.message || 'Login failed');
			seterror(true);
		}
	};

	const changencomponent = (err: boolean) => {
		seterror(err);
	};

	return (
		<>
			{err ? (
				<Errorpop err={errormsg} open={err} changencomponent={changencomponent} />
			) : (
				<div className="flex flex-col gap-5 p-4 max-w-md mx-auto">
					<div className="flex flex-col gap-3">
						<label className="text-lg">Username or Email:</label>
						<input
							type="text"
							value={login.emailOrUsername}
							placeholder="Username or Email"
							className="rounded-lg px-2 py-1"
							onChange={(e) => setlogin({ ...login, emailOrUsername: e.target.value })}
							required
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-lg">Password:</label>
						<input
							type="password"
							value={login.password}
							placeholder="Password"
							className="rounded-lg px-2 py-1"
							onChange={(e) => setlogin({ ...login, password: e.target.value })}
							required
						/>
					</div>

					<div className="flex justify-center mt-4">
						<button
							onClick={handleLogin}
							className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
						>
							Login
						</button>
					</div>
				</div>
			)}
		</>
	);
}
