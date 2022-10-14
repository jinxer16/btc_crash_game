import React from 'react'

const Pagination = ({ nPages, currentPage, setCurrentPage }) => {

    const pageNumbers = [...Array(nPages + 1).keys()].slice(1)

    // console.log("pgNumber", pageNumbers);

    const nextPage = () => {
            if(currentPage !== nPages) setCurrentPage(currentPage + 1)
    }
    const prevPage = () => {
        if(currentPage !== 1) setCurrentPage(currentPage - 1)
    }
    return (
        <nav>
            <ul className='pagination justify-content-center'>
                <li className="page-item ">
                    <a className="page-link paginationext" 
                        onClick={prevPage} 
                        aria-label="Previous"
                        href='#'>
                        
                        <span aria-hidden="true">«</span>
                    </a>
                </li>
                {pageNumbers?.map(pgNumber => (
                
                    <li key={pgNumber} 
                        className= {`page-item ${currentPage == pgNumber ? 'active' : ''} `} >

                        <a onClick={() => setCurrentPage(pgNumber)}  
                            className='page-link paginationext' 
                            href='#'>
                            
                            {pageNumbers.length ? pgNumber : 0 }
                        </a>
                    </li>
                ))}
                <li className="page-item">
                    <a className="page-link paginationext" 
                        onClick={nextPage}
                        href='#'
                        >
                        
                        <span aria-hidden="true">»</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination