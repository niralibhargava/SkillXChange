import React, { useState, useContext } from 'react';
import { Signin } from '../../schema structure/Schema';
import Errorpop from '../Errorpop/Errorpop';
import { username_context } from '../../App';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
	const navigate = useNavigate();
	const { setuser_id } = useContext(username_context);

	const [err, seterror] = useState(false);
	const [errormsg, setmsg] = useState('');

	const [signindata, setsigndata] = useState<Signin>({
		username: '',
		email: '',
		password: '',
	});

	const handleSignup = async () => {
		const { username, email, password } = signindata;

		if (!username || !email || !password) {
			alert('Please fill all the fields');
			return;
		}

		try {
			const res = await fetch('https://skill-api.penneithendral.workers.dev/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(signindata),
			});

			const data = await res.json();
			console.log(data);

			if (data?.error) {
				seterror(true);
				setmsg(data?.error);
			} else if (data?.message) {
				setuser_id(data?.random_id);
				localStorage.setItem('user_id', JSON.stringify(data?.random_id));
				navigate('/');
			}
		} catch (error: any) {
			seterror(true);
			setmsg(error.message);
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
						<label className="text-lg">Username:</label>
						<input
							type="text"
							value={signindata.username}
							className="rounded-lg px-2 py-1"
							placeholder="Username"
							onChange={(e) => setsigndata({ ...signindata, username: e.target.value })}
							required
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-lg">Email:</label>
						<input
							type="email"
							value={signindata.email}
							className="rounded-lg px-2 py-1"
							placeholder="Email"
							onChange={(e) => setsigndata({ ...signindata, email: e.target.value })}
							required
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label className="text-lg">Password:</label>
						<input
							type="password"
							value={signindata.password}
							className="rounded-lg px-2 py-1"
							placeholder="Password"
							onChange={(e) => setsigndata({ ...signindata, password: e.target.value })}
							required
						/>
					</div>

					<div className="flex justify-center mt-4">
						<button
							onClick={handleSignup}
							className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
						>
							Sign Up
						</button>
					</div>
				</div>
			)}
		</>
	);
}
