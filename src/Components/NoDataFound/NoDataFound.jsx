import React from 'react'

function NoDataFound({colSpan}) {
    return (
        <>
            <tr>
                <td colSpan={colSpan} className="text-center text-secondary py-4">
                    No data found
                </td>
            </tr>
        </>
    )
}

export default NoDataFound