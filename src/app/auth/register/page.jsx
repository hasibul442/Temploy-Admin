'use client'
// import { auth, db } from '@/lib/firebase';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function Page() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const router = useRouter();

	const handleRegisterButton = async (e) => {
		e.preventDefault();
		// try {
		//     await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
		//         const user = userCredential.user;
		//         return setDoc(doc(db, 'users', user.uid), {
		//             id : user.uid,
		//             username: user.displayName || name,
		//             uid: user.uid,
		//             email: user.email,
		//             name: name,
		//             status: 0,
		//             role: 'user',
		//             createdAt: new Date().toISOString(),
		//             updatedAt: new Date().toISOString(),
		//         }).then(() => {
		//             router.push('/auth/login');
		//         }).catch((error) => {
		//             console.error("Error writing document: ", error);
		//         });
		//     });
		// } catch (error) {
		//     console.error("Error creating user:", error);
		// }

		console.log("Register clicked", email, password, name);
	}
	return (
		<>
			<main className="main-content  mt-0">
				<section className="min-vh-100 mb-8">
					<div className="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg" style={{ backgroundImage: "url('../assets/img/curved-images/curved14.jpg')" }}>
						<span className="mask bg-gradient-dark opacity-6"></span>
						<div className="container">
							<div className="row justify-content-center">
								<div className="col-lg-5 text-center mx-auto">
									<h1 className="text-white mb-2 mt-5">Welcome!</h1>
									<p className="text-lead text-white">Use these awesome forms to login or create new account in your project for free.</p>
								</div>
							</div>
						</div>
					</div>
					<div className="container">
						<div className="row mt-lg-n10 mt-md-n11 mt-n10">
							<div className="col-xl-4 col-lg-5 col-md-7 mx-auto">
								<div className="card z-index-0">
									<div className="card-header text-center pt-4">
										<h5>Register with</h5>
									</div>
									<div className="card-body">
										<form role="text-left">
											<div className="mb-3">
												<input
													type="text"
													className="form-control"
													placeholder="Name"
													aria-label="Name"
													value={name}
													onChange={(e) => setName(e.target.value)}
												/>
											</div>
											<div className="mb-3">
												<input
													type="email"
													className="form-control"
													placeholder="Email"
													aria-label="Email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
												/>
											</div>
											<div className="mb-3">
												<input
													type="password"
													className="form-control"
													placeholder="Password"
													aria-label="Password"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
												/>
											</div>
											{/* <div className="form-check form-check-info text-left">
                                                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" defaultChecked />
                                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                                    I agree the <a href="javascript:;" className="text-dark font-weight-bolder">Terms and Conditions</a>
                                                </label>
                                            </div> */}
											<div className="text-center">
												<button type="button" className="btn bg-gradient-dark w-100 my-4 mb-2" onClick={handleRegisterButton}>Sign up</button>
											</div>
											<p className="text-sm mt-3 mb-0">Already have an account? <Link href="/auth/login" className="text-dark font-weight-bolder">Sign in</Link></p>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}

export default Page