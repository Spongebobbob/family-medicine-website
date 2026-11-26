import type { Reference } from "@/lib/content";

export function ReferenceList({ references, anchors = false }: { references: Reference[]; anchors?: boolean }) {
  return <ol>{references.map(reference => <li key={reference.id} id={anchors ? `ref-${reference.id}` : undefined}>
    {reference.vancouver ? <><p className="vancouver-citation">{reference.vancouver}</p><div className="reference-links"><a href={reference.url} target="_blank" rel="noopener noreferrer">原文／官方指引</a>{reference.doi && <a href={`https://doi.org/${reference.doi}`} target="_blank" rel="noopener noreferrer">DOI</a>}{reference.pubmed && <a href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pubmed}/`} target="_blank" rel="noopener noreferrer">PubMed</a>}</div></> : <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>}
    <span>{reference.publisher}・查閱日期：{reference.accessed}</span>
  </li>)}</ol>;
}
