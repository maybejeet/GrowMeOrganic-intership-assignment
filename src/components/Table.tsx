import  { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber , type InputNumberValueChangeEvent} from "primereact/inputnumber";
import { FloatLabel } from 'primereact/floatlabel';
import type { DataTablePageEvent } from 'primereact/datatable';

interface List {
    id: number,
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}


const Table = () => {
    //const [selectedRow, setSelectedRow] = useState<List[] | null>(null);
    const [list, setList] = useState<List[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [numRows, setNumRows] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const op = useRef<OverlayPanel>(null);

    const fetchUrl = async (pageNumber: number) =>  {
        const url = `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
        try {
            setLoading(true)
            const response = await fetch(url)
                if(!response){
                    console.log("NO response found");  
                }
                const json = await response.json()
                //console.log(json?.data[0]);
                const dataArray = Array.isArray(json.data) ? json.data : [];
                //console.log("This is dearch data", dataArray);
                setTotalRecords(json.pagination?.total);
                const filteredData : List[] = dataArray.map((item : List) => ({
                    id: item.id,
                    title: item.title,
                    place_of_origin: item.place_of_origin,
                    artist_display: item.artist_display,
                    inscriptions: item.inscriptions,
                    date_start: item.date_start,
                    date_end: item.date_end,
                }));
               setList(filteredData);
               setLoading(false);
        } catch (error) {
            console.log("Error fetching the URL", error)
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }
    useEffect(()=>{
        fetchUrl(page);
    },[page])

    const onPageChange = (event : DataTablePageEvent ) => {
        setPage(event.page! + 1);
    };

    const handleSelectRows = async () => {
        if (numRows && numRows > 0) {
          let remaining = numRows;
          let currentPage = 1;
          const ids: number[] = [];
          
          while (remaining > 0) {
              const url = `https://api.artic.edu/api/v1/artworks?page=${currentPage}`
                const response = await fetch(url)
                if(!response){
                    console.log("NO response found");  
                }
                const json = await response.json()
                const dataArray = Array.isArray(json.data) ? json.data : [];
                if (dataArray.length === 0) break;
                const toTake = Math.min(remaining, dataArray.length);
                ids.push(...dataArray.slice(0, toTake).map((item : List) => item.id));
            remaining -= toTake;
            currentPage++;
        }
    
          setSelectedIds(ids);
          op.current?.hide();
        }
      };
      

        const selectionHeader = (
            <div className="flex items-center gap-2">
            <Button
                type="button"
                icon="pi pi-chevron-down"
                className="p-button-text p-button-sm"
                onClick={(e) => op.current?.toggle(e)}
            />
            <OverlayPanel ref={op}>
                <div className="p-3 flex flex-col gap-2">
                <FloatLabel>
                    <InputNumber
                        value={numRows}
                        onValueChange={(e : InputNumberValueChangeEvent) => setNumRows(e.value ?? null)}
                        //max={list.length}
                        id="number-input"
                        />
                    <label htmlFor="number-input">Select rows...</label>
                </FloatLabel>
                    <div className='flex items-end'>
                        <Button label="Submit" className='w-[50%] p-auto' onClick={handleSelectRows} />
                    </div>
                </div>
            </OverlayPanel>
            </div>
        );

        const visibleSelection = list.filter((row) => selectedIds.includes(row.id));

    return (
        <div className="card m-auto max-w-[80%] ">
            <DataTable 
            value={list} 
            loading={loading}
            rows={12}
            paginator
            first={(page - 1) * 12}
            selectionMode={ 'checkbox'}
            selection={visibleSelection || []}
           // onSelectionChange={(e) => setSelectedRow(e.value)}
           onSelectionChange={(e) => {
            const ids = e.value.map((r: List) => r.id);
            setSelectedIds((prev) => {
              const updated = [...new Set([...prev, ...ids])];
              return updated;
            });
          }}
            dataKey="id"
            lazy
            totalRecords={totalRecords}
            onPage={onPageChange}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            paginatorClassName="justify-center"
            tableStyle={{ minWidth: '50rem' }}>
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} header={selectionHeader}> </Column>
                <Column field="title" header="Title"></Column>
                <Column field="place_of_origin" header="Place of Origin"></Column>
                <Column field="artist_display" header="Artist Display"></Column>
                <Column field="inscriptions" header="Inscriptions"></Column>
                <Column field="date_start" header="Start Date"></Column>
                <Column field="date_end" header="End Date"></Column>
            </DataTable>


        </div>
    );
}

export default Table




        