/* @flow */

import {useSelector} from "react-redux"
import React, {useState} from "react"

import {showContextMenu} from "../../lib/System"
import ColumnDescription from "./ColumnDescription"
import Columns from "../../state/Columns"
import FieldCell from "../FieldCell"
import Log from "../../models/Log"
import PanelHeading from "./PanelHeading"
import SearchBar from "../../state/SearchBar"
import Tab from "../../state/Tab"
import Table from "../Tables/Table"
import BrimTooltip from "../BrimTooltip"

type Props = {
  log: Log,
  contextMenu: Function
}

export default function FieldsPanel({log, contextMenu}: Props) {
  log = log.exclude("_td")
  let program = useSelector(SearchBar.getSearchProgram)
  let tableColumns = useSelector(Columns.getCurrentTableColumns)
  let space = useSelector(Tab.space)
  let columns = tableColumns.getColumns().map((c) => c.name)

  const fieldAt = (log, index) => log.getFieldAt(index)
  const onContextMenu = (log, index) => {
    let field = fieldAt(log, index)
    let m = contextMenu(program, columns, space)(field, log, false)
    return () => showContextMenu(m)
  }

  // Tooltip code
  let [hovered, setHovered] = useState({name: "", type: ""})
  let path = log.getString("_path")

  function enter(e, column) {
    setHovered(column)
  }

  return (
    <div className="fields-table-panel detail-panel">
      <PanelHeading>Fields</PanelHeading>
      <Table className="vertical-table">
        <tbody>
          {log.descriptor.map((column, index) => (
            <tr key={index}>
              <th>
                <span
                  data-tip="column-description"
                  data-place="right"
                  data-effect="solid"
                  data-delay-show={500}
                  onMouseEnter={(e) => enter(e, column)}
                >
                  {column.name}
                </span>
                <BrimTooltip className="brim-tooltip-show-hover">
                  <ColumnDescription column={hovered} path={path} />
                </BrimTooltip>
              </th>
              <td onContextMenu={onContextMenu(log, index)}>
                <FieldCell field={fieldAt(log, index)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
