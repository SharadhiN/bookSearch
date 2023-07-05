import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Typography,
  CardContent,
  CardMedia,
  capitalize
} from "@material-ui/core";
import { CircularProgress, LinearProgress } from "@mui/material";
import { makeStyles } from "@material-ui/styles";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";



const API = "https://gutendex.com/books";


const useStyles = makeStyles({
    bookArea: {
      paddingTop: "30px",
      paddingLeft: "15%",
      paddingRight: "15%",
      width: "100%"
    },
    bookImage: {
      height: "160px",
      width: "160px"
    },
    progress: {
      position: "fixed",
      top: "50%",
      left: "50%",
      marginTop: "-100px",
      marginLeft: "-100px"
    }
});


const App = () => {
    const classes = useStyles();

    // states for books Response data from the API
    const [bookData, setBookData] = useState();
    const [nextResults, setNextResults] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [searchUri, setSearchUri] = useState(null);


    // states for infinite scroll
    const [scrollData, setScrollData] = useState();
    const [hasMoreValue, setHasMoreValue] = useState(true);

    const handleSubmit = () => {
      console.log('searching for books');
      let uri = API + '?search=' + searchValue;
      uri = encodeURI(uri);
      setBookData([]);
      setScrollData([]);
      setSearchUri(uri);
      // fetchBooks(uri);
    }

    const handleTitleChange = (e) => {
      // create the uri with search = query%params and fetch search results
      setSearchValue(e.target.value);
      // e.preventDefault();
    }

    const fetchBooks = async (url) => {
        try {
          var response;
          if ( url ) {
            response = await axios.get(url);
          } else {
            response = await axios.get(API);
          }
          if ( response ) {
            setSearchUri(null);
            setNextResults(response.data.next);
            let newData = [ ...response.data.results];

            if ( newData.length < 16 ) setHasMoreValue(false);

            // check "format" fields in each book to get image, audio info
            newData.forEach(book => {
                let formats = book.formats;
                let bookKeys = Object.keys(formats);
                for (let each of bookKeys) {
                    // make the img url easily accessible
                    if ( each.includes('image/jpeg') ) {
                        book.imgUrl = book.formats[each];
                    }

                    // get the ebook url
                    if ( each.includes('-ebook') ) {
                      book.ebookUrl = book.formats[each];
                    }

                    //TODO: make the audio url easily accessible
                }
            });
            if ( scrollData && scrollData.length > 0 ) newData = [ ...bookData, ...newData ];
            setBookData([...newData]);

            if ( scrollData && scrollData.length > 0 ) loadMoreData();
            else {
              // set scroll data - set initial scroll range
              let end = newData.length < 16 ? newData.length : 16;
              setScrollData(newData.slice(0, end));
              setHasMoreValue(true);
            }
          }
        } catch (axiosError) {
            console.log('Error occurred while trying to fetch API data!');
        }
    };

    const loadMoreData = () => {
        // load more data here by increasing the scroll range
        try {
            let newScrollData = [ ...scrollData, ...bookData.slice(scrollData.length, scrollData.length + 16) ];
            setScrollData([...newScrollData]);
        } catch (err) {
            console.log(err);
        }
    };

    const lastRowHandler = () => {
        // check scroll length and available data length and load more if required.
        if ( (scrollData.length + 16) < bookData.length ) {
          console.log('getting the next batch ready');
          setHasMoreValue(true);
          loadMoreData();
        } else if ( scrollData.length == 16 ) {
          console.log('fetching the next batch');
          fetchBooks(nextResults);
          setHasMoreValue(true);
        } else {
          setHasMoreValue(false);
        }
    };

    const renderBooks = (index) => {
      if ( !bookData || !bookData[index] ) return null;
        const { title, authors, imgUrl } = bookData[index];
        let authorsName = authors.map(a => a.name);

        return (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <Card elevation={20}>
                    <CardContent align="center">
                        <Typography>{"Name: " + capitalize(`${title}`)}</Typography>
                        <Typography>{"Author: " + capitalize(`${authorsName.join(", ")}`)}</Typography>
                        <CardMedia>
                        <div
                            style={{
                            borderRadius: "50%",
                            backgroundColor: "#F2F5C8",
                            maxWidth: "90%"
                            }}
                        >
                            <img className={classes.bookImage} alt={title} src={imgUrl} />
                        </div>
                        </CardMedia>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    useEffect(() => {
        if ( !bookData || bookData.length == 0 ) {
          fetchBooks(null);
        }
    }, []);

    useEffect(() => {
      // if ( !searchUri ) return null;
      if ( searchUri ) fetchBooks(searchUri);
    }, [searchUri]);


    return(
        <div>
            <div>
              <input
                type="text"
                placeholder="Search for a book's title or author here"
                onChange={handleTitleChange}
                value={searchValue}
                size="50"
              />
              <button onClick={handleSubmit}>Search
              </button>
            </div>
            {
                scrollData && scrollData.length > 0 ?
                (
                <InfiniteScroll
                    dataLength={scrollData.length}
                    next={() => lastRowHandler()}
                    hasMore={hasMoreValue}
                    loader={<LinearProgress />}
                    style={{ overflow: "unset" }}
                    endMessage={
                      <p style={{ textAlign: 'center' }}>
                        <b>All books are loaded</b>
                      </p>
                    }
                >
                    <Grid container spacing={4} className={classes.bookArea}>
                       {scrollData.map((book, index) => renderBooks(index))}
                    </Grid>
                </InfiniteScroll>
                )
            :
            <CircularProgress
              color={"success"}
              className={classes.progress}
              size={200}
            />
        }
        </div>
    );

}

export default App;
