import React from 'react'

function Footer() {
	return (
		<>
			<footer className="footer py-5">
				<div className="container">
					<div className="row">
						<div className="col-8 mx-auto text-center mt-1">
							<p className="mb-0 text-secondary">
								Copyright © <script>
									document.write(new Date().getFullYear())
								</script> Soft by Creative Tim.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</>
	)
}

export default Footer