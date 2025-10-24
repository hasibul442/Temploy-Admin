import { DeleteRequestData } from '@/Helper/HttpRequestHelper';
import React from 'react'
import { MdDelete } from "react-icons/md";
import Swal from 'sweetalert2';

function DeleteButton({ id, service, deleteUrl }) {

	const handleDelete = () => {
		Swal.fire({
			title: 'Are you sure?',
			text: `You won't be able to revert this!`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				DeleteRequestData(id, deleteUrl)
					.then(() => {
						Swal.fire({
							position: "top-end",
							icon: "success",
							title: 'Deleted!',
							text: `The ${service} has been deleted successfully.`,
							showConfirmButton: false,
							timer: 1500
						});
						// Optionally, you can also refresh the page or update the state to reflect the deletion
						window.location.reload();
					})
					.catch((error) => {
						Swal.fire(
							'Error!',
							`There was an error deleting the ${service}.`,
							'error'
						);
					});
			}
		});
	};

	return (
		<>
			<button className="btn btn-outline-danger btn-sm p-2 mx-1" type="button" onClick={handleDelete}><MdDelete size={16} /></button>
		</>
	)
}

export default DeleteButton