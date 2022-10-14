import React, { useRef } from 'react'
import './Modal.css'
import {Modal} from 'react-bootstrap';
import popup from "../../images/Game-Pop-up.gif";
import {IoMdClose} from 'react-icons/io'
function ModalShow({modalShow, setModalShow}) {

    return (
    <Modal
    size="lg"
    show={modalShow}
    onHide={() => setModalShow(false)}

    style={{ backgroundColor: 'transparent' }}
    centered
  >
    <Modal.Body className="modal-bg" >

      <div className="row">
        <div className="col-12 d-flex justify-content-end">
          <IoMdClose
            onClick={() => setModalShow(false)}
            size={28}
            style={{ color: "white", cursor: "pointer", }}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center mb-4 mt-2">

        <a href="https://play.google.com/store/apps/details?id=com.heedplay.multipleheedrobot.storehyd" target="_blank"><img src={popup} className="img-fluid" /></a>
      </div>
    </Modal.Body>

  </Modal>
    )
}

export default ModalShow