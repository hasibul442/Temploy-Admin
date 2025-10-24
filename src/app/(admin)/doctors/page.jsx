import React from "react";
import style from "./doctor.module.css";
import { FaEdit, FaUserAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaEye } from "react-icons/fa6";
function Page() {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Doctor's Information</h5>
              <p className="card-text">
                Details about the doctor will go here.
              </p>
            </div>
          </div>

          <div className="row">
            {[...Array(20)].map((_, index) => (
              <div className="col-sm-3 mb-3" key={index}>
                <div className={style.card_client}>
                  <div className={style.user_picture}>
                    <FaUserAlt size={24} />
                  </div>
                  <p className={style.name_client}>
                    Jhon Doe
                    <span>CEO of WritBook</span>
                  </p>
                  <div className={style.action_buttons}>
                    <button className="btn btn-primary">
                      <FaEdit size={18} />
                    </button>

                    <button className="btn btn-success">
                      <FaEye size={18} />
                    </button>

                    <button className="btn btn-danger">
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
