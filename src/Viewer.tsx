/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import React from 'react';

import Slot from './layouts/Slot';
import defaultLayout from './layouts/defaultLayout';
import defaultToolbar from './layouts/defaultToolbar';
import { Layout } from './layouts/Layout';
import { RenderToolbar } from './layouts/ToolbarSlot';
import DocumentLoader from './loader/DocumentLoader';
import LocalizationMap from './localization/LocalizationMap';
import LocalizationProvider from './localization/LocalizationProvider';
import PageSizeCalculator, { PageSize } from './PageSizeCalculator';
import PdfJs from './PdfJs';
import SelectionMode from './SelectionMode';
import downloadFile from './utils/downloadFile';
import ViewerInner from './ViewerInner';

interface File {
    data: PdfJs.FileData;
    name: string;
}

interface ViewerProps {
    // The default zoom level
    // If it's not set, the initial zoom level will be calculated based on the dimesion of page and the container width
    defaultScale?: number;
    fileUrl: string;
    layout?: Layout;
    localization?: LocalizationMap;
    // The text selection mode
    selectionMode?: SelectionMode;
    onDocumentLoad?(doc: PdfJs.PdfDocument): void;
    onZoom?(doc: PdfJs.PdfDocument, scale: number): void;
}

const Viewer: React.FC<ViewerProps> = ({
    defaultScale,
    fileUrl,
    layout,
    localization,
    selectionMode = SelectionMode.Text,
    onDocumentLoad = () => {/**/},
    onZoom = () => {/**/},
}) => {
    const [file, setFile] = React.useState<File>({
        data: fileUrl,
        name: fileUrl,
    });
    const layoutOption = (
        isSidebarOpened: boolean,
        container: Slot,
        main: Slot,
        toolbar: RenderToolbar,
        sidebar: Slot,
    ): React.ReactElement => {
        return defaultLayout(
            isSidebarOpened,
            container,
            main,
            toolbar(defaultToolbar),
            sidebar
        );
    };

    const openFile = (fileName: string, data: Uint8Array) => {
        setFile({
            data,
            name: fileName,
        });
    };

    const download = () => {
        downloadFile(file.name, file.data);
    };

    const renderDoc = (doc: PdfJs.PdfDocument) => {
        const renderInner = (ps: PageSize) => {
            const pageSize = ps;
            pageSize.scale = defaultScale || ps.scale;

            return (
                <ViewerInner
                    doc={doc}
                    fileName={file.name}
                    layout={layout || layoutOption}
                    pageSize={pageSize}
                    selectionMode={selectionMode}
                    onDocumentLoad={onDocumentLoad}
                    onDownload={download}
                    onOpenFile={openFile}
                    onZoom={onZoom}
                />
            );
        };
        return (
            <PageSizeCalculator
                doc={doc}
                render={renderInner}
            />
        );
    };

    return (
        <LocalizationProvider localization={localization}>
            <DocumentLoader
                file={file.data}
                render={renderDoc}
            />
        </LocalizationProvider>
    );
};

export default Viewer;
